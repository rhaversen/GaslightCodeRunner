// Node.js built-in modules
import { performance } from 'perf_hooks'

// Third-party libraries
import ivm from 'isolated-vm'

// Own modules
import type { EvaluationExecutionResults, EvaluationResults, GameResults, submission, TournamentExecutionResults, TournamentResults } from '../../../../sourceFiles/gameRunners/types.d.ts'
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

export enum ErrorCategory {
	STRATEGY_EXECUTION_TIMEOUT = 'STRATEGY_EXECUTION_TIMEOUT',
	STRATEGY_LOADING_TIMEOUT = 'STRATEGY_LOADING_TIMEOUT',
	STRATEGY_ERROR = 'STRATEGY_ERROR',
	SCRIPT_TIMEOUT = 'Script execution timed out', // This is defined by ivm, do not change
	GAME_EXECUTION_ERROR = 'Game execution failed' // This is defined by the game runner, do not change
}

export async function runEvaluation(gameLogicFiles: FileMap, candidate: submission, others: submission[], epochBatchSize: number): Promise<EvaluationResults> {
	const results = await runGame(gameLogicFiles, [candidate, ...others], 'Evaluation', epochBatchSize)

	const evaluationResults: EvaluationResults = {
		error: results.error,
		results: results.results ? {
			candidate: results.results.candidate,
			average: results.results.average
		} : undefined,
		disqualified: results.disqualified?.includes(candidate.submissionId) ? candidate.submissionId : '',
		strategyTimings: results.strategyTimings?.get(candidate.submissionId) || [],
		timedOutPlayers: results.timedOutPlayers
	}

	return evaluationResults
}

export async function runTournament(gameLogicFiles: FileMap, strategies: submission[], epochBatchSize: number): Promise<TournamentResults> {
	const results = await runGame(gameLogicFiles, strategies, 'Tournament', epochBatchSize)

	const tournamentResults: TournamentResults = {
		error: results.error,
		results: results.results,
		disqualified: results.disqualified,
		strategyTimings: results.strategyTimings,
		timedOutPlayers: results.timedOutPlayers,
	}

	return tournamentResults
}

async function runGame(gameLogicFiles: FileMap, strategies: submission[], type: 'Evaluation' | 'Tournament', epochBatchSize: number): Promise<GameResults> {
	const isolate = new ivm.Isolate({ memoryLimit: 1024 })
	const context = await isolate.createContext()

	// Create resolver for termination
	let terminateResolver: (result: GameResults) => void
	const terminationPromise = new Promise<GameResults>(resolve => {
		terminateResolver = resolve
	})

	// Track disqualified players
	const timedOutPlayers = new Set<string>()
	const errorPlayers = new Set<string>()

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
	const strategyTimings = new Map<string, number[]>()

	// Create strategy timing function
	const strategyTimingFunction = new ivm.Reference((submissionId: string, time: number) => {
		if (!strategyTimings.has(submissionId)) {
			strategyTimings.set(submissionId, new Array<number>())
		}
		strategyTimings.get(submissionId)!.push(time)
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

	// Create terminate function that resolves the terminationPromise with the result
	const terminateFunction = new ivm.Reference((category: ErrorCategory, message?: string, submissionId?: string) => {
		console.log('Terminating:', category, message)
		if (submissionId) {
			switch (category) {
				case ErrorCategory.STRATEGY_ERROR:
					errorPlayers.add(submissionId)
					break
				case ErrorCategory.STRATEGY_EXECUTION_TIMEOUT:
				case ErrorCategory.STRATEGY_LOADING_TIMEOUT:
					timedOutPlayers.add(submissionId)
					break
			}
		}

		terminateResolver({
			error: `${category}: ${message}`,
			results: undefined,
			disqualified: Array.from(errorPlayers),
			strategyTimings: strategyTimings,
			timedOutPlayers: Array.from(timedOutPlayers)
		})
	})
	await context.global.set('terminateFunction', terminateFunction)

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
				
				const wrappedStrategy = function(api) {
					// Only measure time on every 1000th epoch
					if (this.epoch % 1000 === 0) {
						const start = performance.now();
						let result;
						try {
							result = strategy(api);
						} catch (error) {
							if (${index === 0} && ${type === 'Evaluation'}) {
								terminateFunction.applySync(undefined, ['${ErrorCategory.STRATEGY_ERROR}', error.message, '${strategies[index].submissionId}']);
							}
							throw error;
						}
						const end = performance.now();

						const duration = end - start;
						strategyTimingFunction.apply(undefined, ['${strategies[index].submissionId}', duration, this.epoch]);

						// Check if strategy took too long
						if (duration > ${strategyTimeout}) {
							timeoutFunction.apply(undefined, ['${strategies[index].submissionId}']);
							if (${index === 0} && ${type === 'Evaluation'}) {
								terminateFunction.applySync(undefined, ['${ErrorCategory.STRATEGY_EXECUTION_TIMEOUT}', 'Strategy took ' + duration + ' ms to execute. Max allowed time is ${strategyTimeout}ms', '${strategies[index].submissionId}']);
							}
						}
						return result;
					} else {
						try {
							const result = strategy(api);
							return result;
						} catch (error) {
							if (${index === 0} && ${type === 'Evaluation'}) {
								terminateFunction.applySync(undefined, ['${ErrorCategory.STRATEGY_ERROR}', error.message, '${strategies[index].submissionId}']);
							}
							throw error;
						}
					}
				};

				const endTime = performance.now();
				const duration = endTime - startTime;
				if (duration > ${strategyTimeout}) {
					timeoutFunction.apply(undefined, ['${strategies[index].submissionId}']);
					if (${index === 0} && ${type === 'Evaluation'}) {
						terminateFunction.applySync(undefined, ['${ErrorCategory.STRATEGY_LOADING_TIMEOUT}', 'Strategy took ' + duration + ' ms to load. Max allowed time is ${strategyTimeout}ms', '${strategies[index].submissionId}']);
					}
				};

				return wrappedStrategy;
			})()
		`).join(',')

	// Construct the test code
	const submissionIds = strategies.map(s => s.submissionId)
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
})();
`

	const result = await Promise.race([
		context.eval(testCode, { timeout: type === 'Evaluation' ? evaluationTimeout : undefined })
			.then(resultString => {
				const parsed = JSON.parse(resultString as string) as EvaluationExecutionResults | TournamentExecutionResults
				
				// Handle cases where all strategies are disqualified in tournament mode
				if (type === 'Tournament' && 
					(errorPlayers.size + timedOutPlayers.size) === strategies.length) {
					return {
						error: 'All strategies were disqualified',
						results: undefined,
						disqualified: Array.from(errorPlayers),
						strategyTimings,
						timedOutPlayers: Array.from(timedOutPlayers)
					}
				}

				return {
					error: parsed.error,
					results: parsed.results,
					disqualified: Array.from([...errorPlayers, ...(parsed.disqualified || [])]),
					strategyTimings,
					timedOutPlayers: Array.from(timedOutPlayers)
				}
			})
			.catch(err => {
				 // Handle script timeouts by adding the candidate to timedOutPlayers
				if (err.message === ErrorCategory.SCRIPT_TIMEOUT && type === 'Evaluation') {
					// For evaluation mode, add the candidate (first strategy) to timedOutPlayers
					timedOutPlayers.add(strategies[0].submissionId)
				}

				return {
				error: err.message,
				results: undefined,
				disqualified: [],
					strategyTimings: strategyTimings,
					timedOutPlayers: Array.from(timedOutPlayers)
				}
			}),
		terminationPromise
	])

	isolate.dispose()
	return result
}
