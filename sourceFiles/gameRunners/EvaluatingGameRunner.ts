/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import { GameLog, GameResults } from './types.ts'

export class Main {
	static run(
		game: Game,
		players: Player[],
		log: GameLog,
	): GameResults {
		const amountOfPlayers = players.length.toString()
		log.apply(undefined, ['Running game with ' + amountOfPlayers + ' players'])

		let totalResults: { [key: string]: number } = {}
		const numEpochs = 100
		const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) {
			log.apply(undefined, ['No candidate player provided'])
			return { error: 'No candidate player provided' }
		}

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			const epochString = (epoch + 1).toString()
			log.apply(undefined, ['Running epoch ' + epochString])

			// Select random players and add candidate
			const randomPlayers = [...otherPlayers]
				.sort(() => Math.random() - 0.5)
				.slice(0, Math.min(epochBatchSize, otherPlayers.length))
			const activePlayers = [candidate, ...randomPlayers]

			try {
				game.init(activePlayers)

				try {
					game.playRound()
					const logsString = 'Results after round: ' + JSON.stringify(game.getResults())
					log.apply(undefined, [logsString])
					// Collect results
					const results = game.getResults()
					for (const [key, value] of results) {
						totalResults[key] = (totalResults[key] || 0) + value
					}
					const logString2 = 'Total results after round: ' + JSON.stringify(totalResults)
					log.apply(undefined, [logString2])
				} catch (error) {
					if (error instanceof Error && error.name === 'PlayerError' && error.message !== undefined) {
						const playerError = error as PlayerError // Cast error to PlayerError
						const logString = 'Player ' + playerError.submissionId.toString() + ' disqualified: ' + error.message.toString()
						log.apply(undefined, [logString])
						const logString2 = 'Returning total results: ' + JSON.stringify(totalResults)
						log.apply(undefined, [logString2])
						// End the evaluation
						return {
							error: error.message,
							disqualified: [playerError.submissionId],
						}
					} else {
						const logsString = 'Error executing player turn, no PlayerError thrown ' + error.toString()
						log.apply(undefined, [logsString])
						throw error
					}
				}
			} catch (error) {
				const logString = 'Game execution failed: ' + (error instanceof Error ? error.message : 'Game execution failed')
				log.apply(undefined, [logString])
				return {
					error: error instanceof Error ? error.message : 'Game execution failed'
				}
			}
		}

		const logString2 = 'Returning total results: ' + JSON.stringify(totalResults)
		log.apply(undefined, [logString2])
		return {
			results: totalResults
		}
	}
}

export default Main
