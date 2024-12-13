/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { GameResults } from './types.d.ts'

export class Main {
	static run(game: Game, players: Player[]): GameResults {
		console.info(`Running tournament with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const totalResults: Record<string, number> = {}
		const numEpochs = 1000
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer

		// Keep track of disqualified players
		const disqualified: string[] = []

		// Create player selector instance for all players
		const playerSelector = new PlayerSelector(players)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = Object.create(game)
			Object.setPrototypeOf(gameInstance, Object.getPrototypeOf(game))

			if (players.length === 0) {
				console.warn('No players left, they have all been disqualified')
				break
			}

			// Select players for the current epoch
			const selectedPlayers = playerSelector.select(epochBatchSize)

			if (selectedPlayers.length === 0) {
				console.warn('No players could be selected this epoch')
				break
			}


			try {
				gameInstance.init(selectedPlayers)

				try {
					gameInstance.playRound()
					const results = gameInstance.getResults()
					if (Object.values(Object.fromEntries(results)).every(v => v === 0)) {
						console.warn('All results are 0')
					}

					for (const [key, value] of results) {
						totalResults[key] = (totalResults[key] || 0) + value
					}
				} catch (error) {
					if (error instanceof PlayerError) {
						console.warn(`Player ${error.submissionId} disqualified: ${error.message}`)

						// Remove disqualified player
						playerSelector.removePlayer(error.submissionId)
						disqualified.push(error.submissionId)

						// Decrement epoch to ensure we run the same number of epochs
						epoch--
					} else {
						console.error(`Error executing player turn: ${error}`)
						throw error
					}
				}
			} catch (error) {
				console.error(`Game execution failed: ${error instanceof Error ? error.message : ''}`)
				return { error: error instanceof Error ? error.message : 'Game execution failed' }
			}
		}

		return {
			results: totalResults,
			disqualified: disqualified.length > 0 ? disqualified : undefined,
		}
	}
}

export default Main
