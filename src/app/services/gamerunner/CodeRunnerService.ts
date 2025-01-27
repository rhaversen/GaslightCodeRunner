// Node.js built-in modules
import { performance } from 'perf_hooks'

// Third-party libraries
import ivm from 'isolated-vm'

// Own modules
import type {
	VMResults
} from '../../../../sourceFiles/gameRunners/types.d.ts'
import { bundleFiles, FileMap } from './bundler.js'
import {
	tournamentGameRunnerFiles,
	evaluatingGameRunnerFiles,
} from '../../utils/sourceFiles.js'
import config from '../../utils/setupConfig.js'
import logger from '../../utils/logger.js'

// Environment variables

// Config variables
const {
	tournamentEpochs,
	evaluationEpochs,
	evaluationTimeout
} = config

// Destructuring and global variables
export enum ErrorCategory {
	SCRIPT_TIMEOUT = 'Script execution timed out', // This is defined by ivm, do not change
	ALL_PLAYERS_DISQUALIFIED = 'All strategies were disqualified'
}

export interface submission {
	submissionId: string
	files: FileMap
}

export async function runEvaluation(
	gameLogicFiles: FileMap,
	candidate: submission,
	others: submission[],
	epochBatchSize: number
): Promise<{
	error?: string
	results?: {
		candidate: number // Candidate's average
		average: number // Total average of other players
	},
	disqualified: string | null // Error or null
	strategyExecutionTimings: number[] | null // Timings
	strategyLoadingTimings: number | null // Timings
}> {
	const results = await runGame(gameLogicFiles, [candidate, ...others], 'Evaluation', epochBatchSize)

	const evaluationResults = {
		error: results.error,
		results: results.results
			? {
				candidate: results.results.candidate,
				average: results.results.average,
			}
			: undefined,
		disqualified: results.disqualified[candidate.submissionId] || null,
		strategyExecutionTimings: results.strategyExecutionTimings?.[candidate.submissionId] || null,
		strategyLoadingTimings: results.strategyLoadingTimings?.[candidate.submissionId] || null
	}

	return evaluationResults
}

export async function runTournament(
	gameLogicFiles: FileMap,
	strategies: submission[],
	epochBatchSize: number
): Promise<{
	error?: string
	results?: Record<string, number> // submissionId -> score
	disqualified: Record<string, string> // submissionId -> error
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}> {
	const results = await runGame(gameLogicFiles, strategies, 'Tournament', epochBatchSize)

	const tournamentResults = {
		error: results.error,
		results: results.results,
		disqualified: results.disqualified,
		strategyExecutionTimings: results.strategyExecutionTimings,
		strategyLoadingTimings: results.strategyLoadingTimings
	}

	return tournamentResults
}

async function runGame(
	gameLogicFiles: FileMap,
	strategies: submission[],
	type: 'Evaluation' | 'Tournament',
	epochBatchSize: number
): Promise<{
	error?: string
	results?: Record<string, number> // submissionId -> score
	disqualified: Record<string, string> // submissionId -> error
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}> {
	const isolate = new ivm.Isolate({ memoryLimit: 1024 })
	const context = await isolate.createContext()

	const loggers = {
		info: new ivm.Reference((...args: any[]) => logger.info('VM:', ...formatArgs(args))),
		error: new ivm.Reference((...args: any[]) => logger.error('VM:', ...formatArgs(args))),
		warn: new ivm.Reference((...args: any[]) => logger.warn('VM:', ...formatArgs(args)))
	}

	// Helper function to format arguments
	const formatArgs = (args: any[]) => args.map(arg => {
		try {
			return typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
		} catch {
			return String(arg)
		}
	})

	// Set up loggers in VM context
	await Promise.all(
		Object.entries(loggers).map(([key, value]) =>
			context.global.set(`${key}Log`, value)
		)
	)

	// Setup console in VM
	await context.eval(`
		console = {
			error: (...args) => errorLog.apply(undefined, args),
			warn: (...args) => warnLog.apply(undefined, args),
			info: (...args) => infoLog.apply(undefined, args)
		};
	`)

	// Create a map of submissionId -> array of execution times
	const strategyExecutionTimings: Record<string, number[]> = {}
	const strategyLoadingTimings: Record<string, number> = {}

	// Called inside the VM to record each strategy’s run time
	const strategyExecutionTimingFunction = new ivm.Reference((submissionId: string, time: number) => {
		if (!strategyExecutionTimings[submissionId]) {
			strategyExecutionTimings[submissionId] = []
		}
		strategyExecutionTimings[submissionId].push(time)
	})
	await context.global.set('strategyExecutionTimingFunction', strategyExecutionTimingFunction)

	// Called inside the VM to record each strategy’s load time
	const strategyLoadingTimingFunction = new ivm.Reference((submissionId: string, time: number) => {
		strategyLoadingTimings[submissionId] = time
	})
	await context.global.set('strategyLoadingTimingFunction', strategyLoadingTimingFunction)

	// Provide performance.now() inside the VM
	const perfNowRef = new ivm.Reference(() => performance.now())
	await context.global.set('perfNowRef', perfNowRef)

	// Inject a performance object into the VM
	await context.eval(`
		const performance = {
			now: () => perfNowRef.applySync(undefined)
		};
  `)

	// Bundle game logic
	const gameLogicCode = await bundleFiles(gameLogicFiles, 'Game')

	// Select & bundle the correct runner
	let gameRunnerCode: string
	if (type === 'Evaluation') {
		gameRunnerCode = await bundleFiles(evaluatingGameRunnerFiles, 'GameRunner')
	} else {
		gameRunnerCode = await bundleFiles(tournamentGameRunnerFiles, 'GameRunner')
	}

	// Bundle each strategy
	const strategyBundles = await Promise.all(
		strategies.map((s) => bundleFiles(s.files, 'Strategy'))
	)

	// Build the code for each strategy
	const strategiesStr = strategyBundles
		.map((bundle, index) => `
			(() => {
				// Measure load time
				const loadStart = performance.now();

				${bundle}
				const strategy = Strategy.default;

				const loadEnd = performance.now();
				const loadDuration = loadEnd - loadStart;

				// Record the time
				strategyLoadingTimingFunction.applySync(undefined, [
					'${strategies[index].submissionId}',
					loadDuration
				]);

				// Wrap the strategy call so we can measure each call time
				const wrappedStrategy = function(api) {
					// Only measure time on every 100th epoch
					if (this.epoch % 100 === 0) {
						const executionStart = performance.now();

						try {
							// Call the strategy
							strategy(api);
						} catch (err) {
							// Add the submissionId to the error
							err.submissionId = '${strategies[index].submissionId}';
							throw err;
						}

						const executionEnd = performance.now();
						const duration = executionEnd - executionStart;

						// Record the time
						strategyExecutionTimingFunction.apply(undefined, [
							'${strategies[index].submissionId}',
							duration
						]);
					} else {
						// Non-measured calls
						try {
							strategy(api);
						} catch (err) {
							// Add the submissionId to the error
							err.submissionId = '${strategies[index].submissionId}';
							throw err;
						}
					}
				};

				return wrappedStrategy;
			})()
		`).join(',')

	// Construct the main test code that runs the game
	const submissionIds = strategies.map((s) => s.submissionId)
	const numEpochs = type === 'Evaluation' ? evaluationEpochs : tournamentEpochs
	const testCode = `
(() => {
	// Evaluate game logic in its own scope
	const GameModule = (() => {
		${gameLogicCode}
		return Game;
	})();

	// Evaluate game runner in its own scope
	const GameRunnerModule = (() => {
		${gameRunnerCode}
		return GameRunner;
	})();

	// Build array of wrapped strategies
	const strategies = [${strategiesStr}];
	const submissionIds = ${JSON.stringify(submissionIds)};

	// Create array of Player objects as expected by GameRunner
	const players = strategies.map((strategy, index) => ({
		submissionId: submissionIds[index],
		strategy
	}));

	// Create a factory for Game instances
	const gameFactory = () => new GameModule.default();

	// Run the game
	const result = GameRunnerModule.default.run(gameFactory, players, ${numEpochs}, ${epochBatchSize});
	return JSON.stringify(result);
})();
`

	// Execute the code in the VM
	const result = await context
		.eval(testCode, {
			// For "Evaluation" runs, we impose a script-level timeout
			timeout: type === 'Evaluation' ? evaluationTimeout : undefined
		})
		.then((resultString) => {
			const parsed = JSON.parse(resultString as string) as VMResults

			// Handle scenario where all are disqualified in a tournament
			if (
				type === 'Tournament' &&
				(parsed.disqualified && Object.keys(parsed.disqualified).length === strategies.length)
			) {
				return {
					error: ErrorCategory.ALL_PLAYERS_DISQUALIFIED,
					results: undefined,
					disqualified: parsed.disqualified,
					strategyExecutionTimings,
					strategyLoadingTimings
				}
			}

			// Simulation completed successfully
			return {
				error: parsed.error,
				results: parsed.results,
				disqualified: parsed.disqualified,
				strategyExecutionTimings,
				strategyLoadingTimings
			}
		})
		.catch((err) => {
			return {
				error: err.message,
				results: undefined,
				disqualified: undefined,
				strategyExecutionTimings,
				strategyLoadingTimings
			}
		})

	isolate.dispose()
	return {
		error: result.error,
		results: result.results,
		disqualified: result.disqualified || {},
		strategyExecutionTimings: result.strategyExecutionTimings,
		strategyLoadingTimings: result.strategyLoadingTimings
	}
}
