/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from './commonTypes.d.ts'
import { PlayerError } from './errors.ts'

export class Main {
	static run = (
		game: Game,
		players: Player[],
		callbacks: any,
		logger: any,
	): { results?: Map<string, number>; disqualified?: string[]; error?: string } => {
		logger
			.getSync('log')
			.applySync(undefined, ['Logging from inside VM'])
		let totalResults = new Map<string, number>()
		const numTrials = 100
		const disqualified: string[] = []

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) {
			return { error: 'No candidate player provided' }
		}

		for (let trial = 0; trial < numTrials; trial++) {
			// For each trial, select random players and add candidate
			const randomPlayers = [...otherPlayers]
				.sort(() => Math.random() - 0.5)
				.slice(0, Math.min(5, otherPlayers.length))
			const activePlayers = [candidate, ...randomPlayers]

			try {
				game.init(activePlayers)

				for (let i = 0; i < activePlayers.length; i++) {
					try {
						game.executePlayerTurn()
						// Collect results
						const results = game.getResults()
						for (const [key, value] of results) {
							totalResults.set(key, (totalResults.get(key) || 0) + value)
						}
					} catch (error) {
						if (error instanceof PlayerError) {
							callbacks
								.getSync('disqualifySubmission')
								.applySync(undefined, [activePlayers[i].submissionId, error.message])
							// If candidate is disqualified, end the evaluation
							if (activePlayers[i].submissionId === candidate.submissionId) {
								return {
									results: totalResults,
									error: error.message,
									disqualified: [candidate.submissionId]
								}
							}
						}
					}
				}
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : 'Game execution failed'
				}
			}
		}

		return {
			results: totalResults,
			disqualified: disqualified.length > 0 ? disqualified : undefined // Return undefined if no players were disqualified
		}
	}
}

export default Main
