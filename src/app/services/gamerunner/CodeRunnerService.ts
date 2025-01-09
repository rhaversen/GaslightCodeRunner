// Node.js built-in modules
import { performance } from 'perf_hooks'

// Third-party libraries
import ivm from 'isolated-vm'

// Own modules
import type { EvaluationExecutionResults, EvaluationResults, submission, TournamentExecutionResults, TournamentResults } from '../../../../sourceFiles/gameRunners/types.d.ts'
import { bundleFiles, FileMap } from './bundler.js'
import { tournamentGameRunnerFiles, evaluatingGameRunnerFiles, } from '../../utils/sourceFiles.js'
import config from '../../utils/setupConfig.js'

// Environment variables

// Config variables
const {
	tournamentEpochs,
	evaluationEpochs,
	evaluationTimeout,
	strategyTimeout
} = config

// Destructuring and global variables

export async function runEvaluation(gameLogicFiles: FileMap, candidate: submission, others: submission[], epochBatchSize: number): Promise<EvaluationResults> {
	return runGame(gameLogicFiles, [candidate, ...others], 'Evaluation', epochBatchSize) as Promise<EvaluationResults>
}

export async function runTournament(gameLogicFiles: FileMap, strategies: submission[], epochBatchSize: number): Promise<TournamentResults> {
	return runGame(gameLogicFiles, strategies, 'Tournament', epochBatchSize) as Promise<TournamentResults>
}

async function runGame(gameLogicFiles: FileMap, strategies: submission[], type: 'Evaluation' | 'Tournament', epochBatchSize: number): Promise<EvaluationResults | TournamentResults> {
	const isolate = new ivm.Isolate({ memoryLimit: 128 })
	const context = await isolate.createContext()

	// Track disqualified players
	const timedOutPlayers = new Set<string>()

	// Create log function
	const log = new ivm.Reference((...args: any[]) => {
		console.log('VM:', ...args.map(arg => {
			try {
				return typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
			} catch {
				return String(arg)
			}
		}))
	})
	await context.global.set('log', log)

	// Set up console.log override
	const consoleLogSetup = `
		console = {
			log: (...args) => log.apply(undefined, args),
			error: (...args) => log.apply(undefined, ['\x1b[31mERROR:\x1b[0m', ...args]),
			warn: (...args) => log.apply(undefined, ['\x1b[33mWARN:\x1b[0m', ...args]),
			info: (...args) => log.apply(undefined, ['\x1b[36mINFO:\x1b[0m', ...args])
		};
	`
	await context.eval(consoleLogSetup)

	// Create strategy timing epoch time array 
	const strategyTimings = new Map<string, Map<number, number>>()

	// Create strategy timing function
	const strategyTimingFunction = new ivm.Reference((submissionId: string, time: number, epoch: number) => {
		if (!strategyTimings.has(submissionId)) {
			strategyTimings.set(submissionId, new Map<number, number>())
		}
		strategyTimings.get(submissionId)!.set(epoch, time)
	})
	await context.global.set('strategyTimingFunction', strategyTimingFunction)

	// Create timeout function that adds to disqualifiedPlayers
	const timeoutFunction = new ivm.Reference((submissionId: string) => {
		console.log(`Submission ${submissionId} timed out`)
		timedOutPlayers.add(submissionId)
	})
	await context.global.set('timeoutFunction', timeoutFunction)

	// Create a reference to performance.now()
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

	// Select game runner and bundle
	let gameRunnerCode: string
	if (type === 'Evaluation') {
		gameRunnerCode = await bundleFiles(evaluatingGameRunnerFiles, 'GameRunner')
	} else {
		gameRunnerCode = await bundleFiles(tournamentGameRunnerFiles, 'GameRunner')
	}

	// Bundle strategies
	const strategyBundles = await Promise.all(
		strategies.map(s => bundleFiles(s.files, 'Strategy'))
	)

	// Create strategy strings with execution timing
	const strategiesStr = strategyBundles
		.map((bundle, index) => `
			(() => {
				const startTime = performance.now();
				${bundle}
				const strategy = Strategy.default;

				log.apply(undefined, ['${strategies[index].submissionId} loaded']);
				
				const wrappedStrategy = function(api) {
					// Only measure time on every 1000th epoch
					if (this.epoch % 1000 === 0) {
						const start = performance.now();
						const result = strategy(api);
						const end = performance.now();

						const duration = end - start;
						strategyTimingFunction.apply(undefined, ['${strategies[index].submissionId}', duration, this.epoch]);

						// Only check timeout on these epochs
						if (duration > ${strategyTimeout}) {
							timeoutFunction.applySync(undefined, ['${strategies[index].submissionId}']);
						}
						return result;
					} else {
						// Skip timing on other epochs
						return strategy(api);
					}
				};

				const endTime = performance.now();
				if (endTime - startTime > ${strategyTimeout}) {
					timeoutFunction.applySync(undefined, ['${strategies[index].submissionId}']);
				};

				return wrappedStrategy;
			})()
		`).join(',')

	// Construct the test code
	const submissionIds = strategies.map(s => s.submissionId)
	const numEpochs = type === 'Evaluation' ? evaluationEpochs : tournamentEpochs
	const testCode = `
		(() => {
			try {
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

				// Evaluate player strategies in their own scopes
				const strategies = [${strategiesStr}];
				const submissionIds = ${JSON.stringify(submissionIds)};

				// Create array of Player objects as expected by GameRunner
				const players = strategies.map((strategy, index) => ({
					submissionId: submissionIds[index],
					strategy: strategy
				}));

				// Create a factory function for Game instances
				const gameFactory = () => new GameModule.default();

				// Pass the factory to the GameRunner
				const result = GameRunnerModule.default.run(gameFactory, players, ${numEpochs}, ${epochBatchSize});
				const resultStr = JSON.stringify(result);
				return resultStr;
			} catch (e) {
				return JSON.stringify({ error: e.message });
			}
		})();
	`

	try {
		const resultString: string = type === 'Evaluation'
			? await context.eval(testCode, { timeout: evaluationTimeout })
			: await context.eval(testCode)

		// Check if any players were disqualified during execution
		if (timedOutPlayers.size > 0) {
			return {
				disqualified: Array.from(timedOutPlayers),
				error: 'Strategy execution timed out',
				strategyTimings
			}
		}

		const results = JSON.parse(resultString) as EvaluationExecutionResults | TournamentExecutionResults

		if (type === 'Evaluation') {
			const evaluationResults = results as EvaluationResults
			// Add strategy timings to the results
			evaluationResults.strategyTimings = strategyTimings.get(strategies[0].submissionId)!

			return evaluationResults
		} else if (type === 'Tournament') {
			const tournamentResults = results as TournamentResults
			// Add strategy timings to the results
			tournamentResults.strategyTimings = strategyTimings

			return tournamentResults
		} else {
			return { error: 'Invalid game type', strategyTimings }
		}
	} catch (err: any) {
		console.error(err)
		// Check if the err is a timeout
		// Error: Script execution timed out.
		if (err.message === 'Script execution timed out.') {
			return {
				disqualified: [strategies[0].submissionId],
				error: 'Script execution timed out.',
				strategyTimings
			}
		}
		return { error: err.message, strategyTimings }
	} finally {
		isolate.dispose()
	}
}
