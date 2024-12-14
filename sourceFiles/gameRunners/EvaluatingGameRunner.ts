/* eslint-disable local/enforce-comment-order */

import PlayerSelector from './PlayerSelector.ts'
import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import type { EvaluationResults } from './types.d.ts'
import { insertRandomly } from './utils.ts'

export class Main {
	static run(game: Game, players: Player[]): EvaluationResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) return { error: 'No players provided' }

		const numEpochs = 100
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer
		let totalTurns = 0
		let maxTurnCount = 0

		let totalCandidateScore = 0
		let totalOtherScores = 0

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
					maxTurnCount = Math.max(maxTurnCount, stats?.turnCount ?? 0)

					// Get the candidate's score
					const candidateScore = results.get(candidate.submissionId) ?? 0
					// Get the scores of other players
					const otherScores = Array.from(results.entries())
						.filter(([id]) => id !== candidate.submissionId)
						.map(([, score]) => score)
					// Calculate average score of other players
					const averageScoreOthers = otherScores.reduce((a, b) => a + b, 0) / otherScores.length

					// Add to total scores
					totalCandidateScore += candidateScore
					totalOtherScores += averageScoreOthers
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
		console.info(`max turns: ${maxTurnCount}`)
		const totalResults = {
			candidate: totalCandidateScore / numEpochs,
			average: totalOtherScores / numEpochs,
		}
		return { results: totalResults }
	}
}

export default Main
