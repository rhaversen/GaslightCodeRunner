// Node.js built-in modules

// Third-party libraries
import ivm from 'isolated-vm'
import type { GameResults } from '../../../../sourceFiles/gameRunners/types.d.ts'
import { bundleFiles, FileMap } from './bundler.js'
import { tournamentGameRunnerFiles, evaluatingGameRunnerFiles, } from '../../utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function runGame(gameLogicFiles: FileMap, strategyFiles: FileMap[], type: 'Evaluation' | 'Tournament'): Promise<GameResult> {
	const isolate = new ivm.Isolate({ memoryLimit: 128 })
	const context = await isolate.createContext()
	const jail = context.global

	// Set up sandbox environment
	await jail.set('global', jail.derefInto())
	await jail.set('require', undefined)
	await jail.set('import', undefined)

	// Bundle game logic
	const gameLogicCode = await bundleFiles(gameLogicFiles, 'Game')

	// Select game runner and bundle
	let gameRunnerCode: string
	if (type === 'Evaluation') {
		gameRunnerCode = await bundleFiles(evaluatingGameRunnerFiles, 'GameRunner')
	} else {
		gameRunnerCode = await bundleFiles(tournamentGameRunnerFiles, 'GameRunner')
	}

	// Bundle and create players from strategies
	const players: Player[] = await Promise.all(
		strategyFiles.map(async (files, index) => {
			const bundledStrategy = await bundleFiles(files, 'Strategy')
			return {
				submissionId: `player${index + 1}`,
				strategy: (api) => {
					try {
						return context.evalClosureSync(bundledStrategy, [api], {
							arguments: { reference: true },
							timeout: 500,
						})
					} catch (error: any) {
						if (error.message.includes('Script execution timed out')) {
							console.log(`Strategy timeout for player${index + 1}`)
						}
						throw error
					}
				},
			}
		})
	)

	const vmExecutor = (
		gameRunnerCode: string,
		gameLogicCode: string,
		players: any[],
		callbacksRef: any,
		loggerRef: any
	) => {
		// Evaluate the game logic and get the Game class
		const GameLogic = new Function(`
			${gameLogicCode}
			return Game.default;
		`)()

		// Evaluate the game runner and get the Main class
		const GameRunner = new Function(`
			${gameRunnerCode}
			return GameRunner.default;
		`)()

		if (!GameLogic || !GameRunner) {
			throw new Error('Failed to load game class or game runner definition')
		}

		console.log('gameLogic:', GameLogic)
		console.log('gameRunner:', GameRunner)

		loggerRef.log('Logging from inside VM')

		const game = new GameLogic()
		console.log('game:', game)
		const result = GameRunner.run(game, players, callbacksRef, loggerRef)

		return result
	}


	try {
		const vmExecutorString = vmExecutor.toString()
		const result = await context.evalClosureSync(
			vmExecutorString,
			[
				gameRunnerCode,
				gameLogicCode,
				players,
				new ivm.Reference({
					disqualifySubmission: (submissionId: string, message: string) =>
						console.log(`Submission ${submissionId} disqualified.\nReason: ${message}`),
				}),
				new ivm.Reference(console),
			],
			{ arguments: { reference: true }, timeout: 2000 }
		)
		console.log('Game execution result:', result)
		// Convert result back to expected format if needed
		if (result && result.results) {
			return new Map(Object.entries(result.results))
		}
		return new Map([['error', result?.error || 'No result returned from game execution']])
	} catch (err) {
		console.error('Error running game:', err)
		throw err
	} finally {
		isolate.dispose()
	}
}
