import './securityBootstrap.ts'
import type { Game, Player } from '../commonTypes.d.ts'

import PlayerSelector from './PlayerSelector.ts'
import { RunningAverage } from './RunningAverage.ts'
import type { VMResults } from './types.d.ts'

export class Main {
	static run (gameFactory: () => Game, players: Player[], numEpochs: number, tableSize: { minPlayers: number, maxPlayers: number }): VMResults {
		console.info(`Running tournament with ${players.length} players`)

		if (players.length === 0) { return { error: 'No players provided' } }

		// Tournaments rank real submissions, so a table is never filled with
		// duplicates: if the roster cannot seat a legal game, fail fast.
		if (players.length < tableSize.minPlayers) {
			return { error: `Not enough players: need at least ${tableSize.minPlayers}, have ${players.length}` }
		}

		// Track disqualified players
		const disqualified: Record<string, string> = {}

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

			// Seat up to the game's max; the roster may be smaller than maxPlayers.
			// Disqualifications shrink the roster mid-run, so the table size is
			// recomputed each epoch and can drop below minPlayers - the game then
			// decides whether it can still run.
			const seatCount = Math.min(tableSize.maxPlayers, players.length)
			const selectedPlayers = playerSelector.select(seatCount).map(player => ({
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
				// Check if the error is a disqualification
				if (error && typeof error === 'object' && error.submissionId !== undefined) {
					// Report the disqualification
					console.warn(`Player ${error.submissionId} disqualified: ${error.message}`)

					// Remove disqualified player
					playerSelector.removePlayer(error.submissionId)

					// Store disqualified player
					disqualified[error.submissionId] = error.message

					// Decrement epoch to ensure we run the same number of epochs
					epoch--
				} else {
					console.error(`Error executing player turn: ${error}`)
					return { error: error instanceof Error ? error.message : 'Game execution failed' }
				}
			}
		}

		// Prepare the final results
		const finalResults: VMResults = {
			results: {}
		}
		finalResults.results = {}

		for (const [submissionId, runningAvg] of Object.entries(averageScores)) {
			finalResults.results[submissionId] = runningAvg.getAverage()
		}

		if (Object.keys(disqualified).length > 0) {
			finalResults.disqualified = disqualified
		}

		return finalResults
	}
}

export default Main
