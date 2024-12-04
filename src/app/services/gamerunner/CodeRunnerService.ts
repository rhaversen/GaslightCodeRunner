/* eslint-disable local/enforce-comment-order */
import ivm from 'isolated-vm'
import { Player, GameResult } from '../../games/commonTypes.js'
import gameRunner from '../../games/gameRunner.js'
import { CodeRunnerCallbacks, GameRunner } from './types.js'
import { bundleFiles } from './bundler.js'

export async function runGame(gameFiles: { [key: string]: string }, strategyFiles: { [key: string]: string }[]): Promise<GameResult> {
	const isolate = new ivm.Isolate({ memoryLimit: 128 })
	const context = await isolate.createContext()
	const jail = context.global

	// Set up sandbox environment
	await jail.set('global', jail.derefInto())
	await jail.set('require', undefined)
	await jail.set('import', undefined)

	// Bundle game logic
	const gameLogic = await bundleFiles(gameFiles)

	// Bundle and create players from strategies
	const players: Player[] = await Promise.all(
		strategyFiles.map(async (files, index) => {
			const bundledStrategy = await bundleFiles(files)
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

	const vmExecutor = (gameRunner: GameRunner, gameLogic: string, players: Player[], callbacks: CodeRunnerCallbacks) => {
		// Evaluate and get the Game class directly
		const GameClass = new Function(`
			${gameLogic}
			return Game.Main;  // Game is the global name we set in esbuild
		`)()

		if (!GameClass) {
			throw new Error('Failed to load game class definition')
		}

		const game = new GameClass()
		const result = gameRunner(game, players, callbacks)

		// Ensure the result is properly returned
		if (result && result.results) {
			// Convert Map to plain object for serialization
			return {
				results: Object.fromEntries(result.results),
				error: result.error
			}
		}
		return result
	}

	try {
		const vmExecutorString = vmExecutor.toString()
		const result = await context.evalClosureSync(
			vmExecutorString,
			[
				new ivm.Reference(gameRunner),
				new ivm.Reference(gameLogic),
				new ivm.Reference(players),
				new ivm.Reference({
					disqualifySubmission: (submissionId, message) => console.log(`Submission ${submissionId} disqualified.\nReason: ${message}`),
				} as CodeRunnerCallbacks),
			],
			{ arguments: { reference: true }, timeout: 2000 }
		)

		console.log('Game result:', result)
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
