/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import { GameResults } from './types.ts'

export class Main {
	static run(game: Game, players: Player[]): GameResults {
		console.info(`Running tournament with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const totalResults: Record<string, number> = {}
		const numEpochs = 1000
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer
		const disqualified: string[] = []

		// Clone players array to avoid modifying the original
		let activePlayers = [...players]

		// Use submissionId as the key for uniform distribution tracking
		const playerSelectionCounts = new Map<string, number>()
		for (const p of activePlayers) playerSelectionCounts.set(p.submissionId, 0)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = Object.create(game)
			Object.setPrototypeOf(gameInstance, Object.getPrototypeOf(game))

			if (activePlayers.length === 0) {
				console.warn('No active players left')
				break
			}

			// Calculate average selections among the players
			const counts = Array.from(playerSelectionCounts.values())
			const avgSelections = counts.reduce((sum, c) => sum + c, 0) / (counts.length || 1)

			// Filter players who are not selected too often
			const eligiblePlayers = activePlayers.filter(p =>
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
						// Remove disqualified player from active players and add to disqualified list
						activePlayers = activePlayers.filter(p => p.submissionId !== error.submissionId)
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
