/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { GameResults } from './types.d.ts'
import { insertRandomly } from './utils.ts'

export class Main {
	static run(game: Game, players: Player[]): GameResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const totalResults: Record<string, number> = {}
		const numEpochs = 100
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer
		let totalTurns = 0

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) return { error: 'No candidate player provided' }

		// Create player selector instance for other players
		const playerSelector = new PlayerSelector(otherPlayers)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = Object.create(game) as Game
			Object.setPrototypeOf(gameInstance, Object.getPrototypeOf(game))

			// Select players for the current epoch
			const selectedPlayers = playerSelector.select(epochBatchSize - 1)

			// Mix candidate in randomly with selected players
			const activePlayers = insertRandomly(selectedPlayers, candidate)

			try {
				gameInstance.init(activePlayers)

				try {
					gameInstance.playRound()
					const results = gameInstance.getResults()
					const stats = gameInstance.getStats ? gameInstance.getStats() : undefined
					totalTurns += stats?.turnCount ?? 0

					for (const [key, value] of results) {
						totalResults[key] = (totalResults[key] || 0) + value
					}
				} catch (error) {
					if (error instanceof PlayerError) {
						console.warn(`Player ${error.submissionId} disqualified: ${error.message}`)
						return { error: error.message, disqualified: [error.submissionId] }
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

		console.info(`total turns: ${totalTurns}`)
		console.info(`average turns: ${totalTurns / numEpochs}`)
		return { results: totalResults }
	}
}

export default Main
