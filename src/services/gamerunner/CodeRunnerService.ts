/* eslint-disable local/enforce-comment-order */
import ivm from 'isolated-vm'
import { Player, GameResult } from '../../games/types'
import gameRunner from '../../games/gameRunner'
import { CodeRunnerCallbacks } from './types'

export async function runGame(gameLogic: string, strategies: string[]): Promise<GameResult> {
	const isolate = new ivm.Isolate({ memoryLimit: 128 })
	const context = await isolate.createContext()
	const jail = context.global

	// Set up sandbox environment
	await jail.set('global', jail.derefInto())
	await jail.set('require', undefined)
	await jail.set('import', undefined)

	const players: Player[] = strategies.map((strategy, index) => ({
		submissionId: `player${index + 1}`,
		strategy: (api) => {
			try {
				return context.evalClosureSync(strategy, [api], {
					arguments: { reference: true },
					timeout: 500, // Strategy timeout
				})
			} catch (error: any) {
				if (error.message.includes('Script execution timed out')) {
					console.log(`Strategy timeout for player${index + 1}`)
				}
				throw error
			}
		},
	}))

	const vmExecutor = `
	async (gameRunner, gameLogic, players, callbacks) => {
	  // Create the game instance using the provided gameLogic
	  const GameClass = new Function('return ' + gameLogic)();
	  const game = new GameClass();
  
	  // Use the gameRunner to execute the game
	  return gameRunner(game, players, callbacks);
	}
  `

	try {
		return await context.evalClosureSync(
			vmExecutor,
			[
				new ivm.Reference(gameRunner), // Pass the gameRunner directly
				gameLogic,                     // Pass game logic as a string
				players,                       // Players array
				new ivm.Reference({
					disqualifySubmission: (submissionId, message) => console.log(`Submission ${submissionId} disqualified.\nReason: ${message}`),
				} as CodeRunnerCallbacks),	   // Callbacks object
			],
			{ arguments: { reference: true }, timeout: 2000 } // Timeout for the game
		)
	} catch (err) {
		console.error('Error running game:', err)
		throw err
	} finally {
		isolate.dispose()
	}
}
