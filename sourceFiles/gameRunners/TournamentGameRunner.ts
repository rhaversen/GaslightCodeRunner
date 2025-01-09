/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { TournamentResults } from './types.d.ts'
import { RunningAverage } from './RunningAverage.ts'

export class Main {
	static run(gameFactory: () => Game, players: Player[], numEpochs: number, epochBatchSize: number): TournamentResults {
		console.info(`Running tournament with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

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

			// Select players for the current epoch and inject epoch number
			const selectedPlayers = playerSelector.select(epochBatchSize).map(player => ({
				...player,
				epoch: epoch
			}))

			if (selectedPlayers.length === 0) {
				console.warn('No players could be selected this epoch')
				break
			}

			try {
				gameInstance.init(selectedPlayers)
			} catch (error) {
				return { error: error instanceof Error ? error.message : 'Game initialization failed' }
			}

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
				// Check if the player was disqualified
				// We cannot check instanceof, as the different evaluation contexts will lead to a broken prototype chain 
				if (error && typeof error === 'object' && error.name === 'PlayerError') {
					// Report the disqualification
					const playerError = error as PlayerError
					console.warn(`Player ${playerError.submissionId} disqualified: ${playerError.message}`)

					// Remove disqualified player
					playerSelector.removePlayer(error.submissionId)
					disqualified.push(error.submissionId)

					// Decrement epoch to ensure we run the same number of epochs
					epoch--
				} else {
					console.error(`Error executing player turn: ${error}`)
					return { error: error instanceof Error ? error.message : 'Game execution failed' }
				}
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
