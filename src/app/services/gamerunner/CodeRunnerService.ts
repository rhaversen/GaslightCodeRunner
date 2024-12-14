// Node.js built-in modules

// Third-party libraries
import ivm from 'isolated-vm'

// Own modules
import type { GameResults } from '../../../../sourceFiles/gameRunners/types.d.ts'
import { bundleFiles, FileMap } from './bundler.js'
import { tournamentGameRunnerFiles, evaluatingGameRunnerFiles, } from '../../utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function runGame(gameLogicFiles: FileMap, strategies: { submissionId: string, files: FileMap }[], type: 'Evaluation' | 'Tournament'): Promise<GameResults> {
	const isolate = new ivm.Isolate({ memoryLimit: 128 })
	const context = await isolate.createContext()

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

	// Create the strategies array string
	const submissionIds = strategies.map(s => s.submissionId)
	const strategiesStr = strategyBundles
		.map((bundle, index) => `
			(() => {
				try {
					${bundle}
					return Strategy.default;
				} catch (e) {
					log.apply(undefined, ['Error loading strategy ${index + 1}:', e.message]);
					return null;
				}
			})()
		`).join(',')

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
				const result = GameRunnerModule.default.run(gameFactory, players);
				const resultStr = JSON.stringify(result);
				return resultStr;
			} catch (e) {
				console.error('Error:', e.message);
				return JSON.stringify({ error: e.message });
			}
		})();
	`

	try {
		console.log('Starting execution...')
		const resultString = await context.eval(testCode)
		const results = JSON.parse(resultString) as GameResults
		console.log('Results:', results)

		// Convert results to GameResult map
		return results
	} catch (err) {
		console.error('VM Error:', err)
		throw err
	} finally {
		isolate.dispose()
	}
}
