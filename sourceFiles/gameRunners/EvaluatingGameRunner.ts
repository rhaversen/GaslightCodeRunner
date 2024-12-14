/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { EvaluationResults } from './types.d.ts'
import { insertRandomly } from './utils.ts'
import { RunningAverage } from './RunningAverage.ts'

export class Main {
	static run(gameFactory: () => Game, players: Player[]): EvaluationResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const numEpochs = 10000
		const epochBatchSize = 10

		// Initialize RunningAverage instances
		const candidateAverage = new RunningAverage()
		const othersAverage = new RunningAverage()
		const turnsAverage = new RunningAverage()
		let maxTurnCount = 0

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) return { error: 'No candidate player provided' }

		// Create player selector instance for other players
		const playerSelector = new PlayerSelector(otherPlayers)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = gameFactory()

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

		console.info(`Average turns: ${turnsAverage.getAverage().toFixed(2)}`)
		console.info(`Max turns: ${maxTurnCount}`)

		// Prepare the final results
		const totalResults = {
			candidate: candidateAverage.getAverage(),
			average: othersAverage.getAverage(),
		}
		return { results: totalResults }
	}
}

export default Main
