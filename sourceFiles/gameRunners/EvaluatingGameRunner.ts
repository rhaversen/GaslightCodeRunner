/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import { GameResults } from './types.ts'

export class Main {
	static run(
		game: Game,
		players: Player[],
	): GameResults {
		console.log('Running game with ' + players.length + ' players')

		let totalResults: { [key: string]: number } = {}
		const numEpochs = 100
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) {
			console.log('No candidate player provided')
			return { error: 'No candidate player provided' }
		}

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			console.log('Running epoch ' + (epoch + 1))

			// Select random players and add candidate
			const randomPlayers = [...otherPlayers]
				.sort(() => Math.random() - 0.5)
				.slice(0, Math.min(epochBatchSize, otherPlayers.length))
			const activePlayers = [candidate, ...randomPlayers]

			try {
				game.init(activePlayers)

				try {
					game.playRound()
					console.log('Results after round: ' + JSON.stringify(game.getResults()))
					// Collect results
					const results = game.getResults()
					for (const [key, value] of results) {
						totalResults[key] = (totalResults[key] || 0) + value
					}
					console.log('Total results after round: ' + JSON.stringify(totalResults))
				} catch (error) {
					if (error instanceof Error && error.name === 'PlayerError' && error.message !== undefined) {
						const playerError = error as PlayerError // Cast error to PlayerError
						console.log('Player ' + playerError.submissionId + ' disqualified: ' + error.message)
						console.log('Returning total results: ' + JSON.stringify(totalResults))
						// End the evaluation
						return {
							error: error.message,
							disqualified: [playerError.submissionId],
						}
					} else {
						console.log('Error executing player turn, no PlayerError thrown ' + error)
						throw error
					}
				}
			} catch (error) {
				console.log('Game execution failed: ' + (error instanceof Error ? error.message : 'Game execution failed'))
				return {
					error: error instanceof Error ? error.message : 'Game execution failed'
				}
			}
		}

		console.log('Returning total results: ' + JSON.stringify(totalResults))
		return {
			results: totalResults
		}
	}
}

export default Main
