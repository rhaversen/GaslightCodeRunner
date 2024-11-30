/* eslint-disable local/enforce-comment-order */

import { gameState } from './gameState.js'
import { Player, PlayerError } from './types.js'
import { GameCallbacks, GameResult } from '../index.js'
import { createStrategyAPI } from './strategyAPI.js'

export default async function main(players: Player[], callbacks: GameCallbacks): Promise<GameResult> {
	try {
		gameState.init(players.map(player => player.submissionId))

		for (let i = 0; i < players.length; i++) {
			const currentPlayerIndex = gameState.getCurrentPlayerIndex()

			const api = createStrategyAPI(currentPlayerIndex)

			try {
				// Execute player strategy with 1 second timeout
				await Promise.race([
					players[currentPlayerIndex].strategy(api),
					new Promise((_resolve, reject) => setTimeout(() => reject(new PlayerError('Player timed out')), 1000))
				])
			} catch (error) {
				if (error instanceof PlayerError) {
					callbacks.disqualifyPlayer(currentPlayerIndex)
				} else {
					throw error
				}
			}
		}

		const results = gameState.getResults()
		return results
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Game execution failed'
		}
	}
}
