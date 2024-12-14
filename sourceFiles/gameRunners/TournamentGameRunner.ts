/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { TournamentResults } from './types.d.ts'
import { RunningAverage } from './RunningAverage.ts'

export class Main {
	static run(gameFactory: () => Game, players: Player[]): TournamentResults {
		console.info(`Running tournament with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const numEpochs = 1000000
		const epochBatchSize = 10

		// Track disqualified players
		const disqualified: string[] = []

		// Create player selector instance for all players
		const playerSelector = new PlayerSelector(players)

		// Initialize structures for incremental averaging using RunningAverage
		const averageScores: Record<string, RunningAverage> = {}

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = gameFactory()

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

					for (const [submissionId, score] of results) {
						// Initialize RunningAverage instance if not already
						if (!(submissionId in averageScores)) {
							averageScores[submissionId] = new RunningAverage()
						}

						// Update running average
						averageScores[submissionId].update(score)
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

		// Prepare the final results
		const finalResults: TournamentResults = {
			results: {},
		}
		finalResults.results = {}

		for (const [submissionId, runningAvg] of Object.entries(averageScores)) {
			finalResults.results[submissionId] = runningAvg.getAverage()
		}

		if (disqualified.length > 0) {
			finalResults.disqualified = disqualified
		}

		return finalResults
	}
}

export default Main
