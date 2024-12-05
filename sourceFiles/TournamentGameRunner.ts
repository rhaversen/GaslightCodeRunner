/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from './commonTypes.d.ts'
import { PlayerError } from './errors.ts'
import { GameResults } from './gameRunners/types'

export class Main {
	static run = (
		game: Game,
		players: Player[],
		callbacks: any,
		logger: any,
	): GameResults => {
		logger
			.getSync('log')
			.applySync(undefined, ['Logging from inside VM'])
		let totalResults = new Map<string, number>()
		const numTrials = 1000
		const disqualified: string[] = []
		let activePlayers = [...players]

		for (let trial = 0; trial < numTrials; trial++) {
			// Shuffle the active players
			const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5)
			try {
				game.init(shuffledPlayers)

				for (let i = 0; i < shuffledPlayers.length; i++) {
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
								.applySync(undefined, [shuffledPlayers[i].submissionId, error.message])
							// Remove disqualified player from activePlayers
							activePlayers = activePlayers.filter(
								player => player.submissionId !== shuffledPlayers[i].submissionId
							)
							// Add submissionId to disqualified list
							disqualified.push(shuffledPlayers[i].submissionId)
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
