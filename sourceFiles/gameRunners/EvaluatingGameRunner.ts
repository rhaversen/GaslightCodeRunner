/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import type { VMResults } from './types.d.ts'
import { insertRandomly } from './utils.ts'
import { RunningAverage } from './RunningAverage.ts'

export class Main {
	static run(gameFactory: () => Game, players: Player[], numEpochs: number, epochBatchSize: number): VMResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		// Initialize RunningAverage instances
		const candidateAverage = new RunningAverage()
		const othersAverage = new RunningAverage()
		const turnsAverage = new RunningAverage()
		let maxTurnCount = 0

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) return { error: 'No candidate player provided' }
		if (!otherPlayers.length) return { error: 'No other players provided' }

		// Create player selector instance for other players
		const playerSelector = new PlayerSelector(otherPlayers)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = gameFactory()

			// Select players for the current epoch
			const selectedPlayers = playerSelector.select(epochBatchSize - 1).map(player => ({
				...player,
				epoch
			}))

			// Mix candidate in randomly with selected players
			const activePlayers = insertRandomly(selectedPlayers, { ...candidate, epoch })

			try {
				gameInstance.init(activePlayers)
			} catch (error) {
				return { error: error instanceof Error ? error.message : 'Game initialization failed' }
			}

			try {
				gameInstance.playRound()
				const results = gameInstance.getResults()
				const stats = gameInstance.getStats ? gameInstance.getStats() : undefined
				const turnCount = stats?.turnCount ?? 0

				// Get the candidate's score
				const candidateScore = results.get(candidate.submissionId) ?? 0

				// Get the scores of other players
				const otherScores: number[] = []
				const targetId = candidate.submissionId
				for (const entry of results) {
					const id = entry[0]
					const score = entry[1]
					if (id !== targetId) {
						otherScores.push(score)
					}
				}

				// Calculate average score of other players
				const totalOtherScores = otherScores.reduce((a, b) => a + b, 0)
				const averageOtherScore = totalOtherScores / otherScores.length

				// Update max turn count
				maxTurnCount = Math.max(maxTurnCount, turnCount)

				// Update running averages
				turnsAverage.update(turnCount)
				candidateAverage.update(candidateScore)
				othersAverage.update(averageOtherScore)
			} catch (error) {
				// Check if the error is a disqualification
				if (error && typeof error === 'object' && error.submissionId !== undefined) {
					// Report the disqualification
					console.warn(`Player ${error.submissionId} disqualified: ${error.message}`)
					if (error.submissionId === candidate.submissionId) {
						return { disqualified: { [candidate.submissionId]: error.message } }
					}

					// Remove disqualified player
					playerSelector.removePlayer(error.submissionId)

					// Decrement epoch to ensure we run the same number of epochs
					epoch--
				} else {
					console.error(`Error executing player turn: ${error}`)
					return { error: error instanceof Error ? error.message : 'Game execution failed' }
				}
			}
		}

		console.info(`Average turns: ${turnsAverage.getAverage().toFixed(2)}`)
		console.info(`Max turns: ${maxTurnCount}`)

		// Prepare the final results
		const totalResults = {
			candidate: candidateAverage.getAverage(),
			average: othersAverage.getAverage()
		}
		return { results: totalResults }
	}
}

export default Main
