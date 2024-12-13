/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import { GameResults } from './types.ts'

export class Main {
	static run(game: Game, players: Player[]): GameResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const totalResults: Record<string, number> = {}
		const numEpochs = 100
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) return { error: 'No candidate player provided' }

		// Use submissionId as the key for uniform distribution tracking
		const playerSelectionCounts = new Map<string, number>()
		for (const p of otherPlayers) playerSelectionCounts.set(p.submissionId, 0)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			console.info(`Running epoch ${epoch + 1}`)

			// Create fresh game instance for each epoch
			const gameInstance = Object.create(game)
			Object.setPrototypeOf(gameInstance, Object.getPrototypeOf(game))

			// Calculate average selections among the "otherPlayers"
			const counts = Array.from(playerSelectionCounts.values())
			const avgSelections = counts.reduce((sum, c) => sum + c, 0) / (counts.length || 1)

			// Filter players who are not selected too often
			const eligiblePlayers = otherPlayers.filter(p =>
				(playerSelectionCounts.get(p.submissionId) ?? 0) <= avgSelections + 1
			)

			// Randomly pick a subset of players for this game
			const selectedPlayers = [...eligiblePlayers]
				.sort(() => Math.random() - 0.5)
				.slice(0, Math.min(epochBatchSize, eligiblePlayers.length))

			// Update selection counts
			for (const p of selectedPlayers) {
				playerSelectionCounts.set(p.submissionId, (playerSelectionCounts.get(p.submissionId) ?? 0) + 1)
			}

			// Mix candidate in randomly
			const activePlayers = [candidate, ...selectedPlayers].sort(() => Math.random() - 0.5)

			try {
				gameInstance.init(activePlayers)

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

		console.info(`Returning total results: ${JSON.stringify(totalResults)}`)
		return { results: totalResults }
	}
}

export default Main
