/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { PlayerError } from '../errors.ts'
import { GameResults } from './types.ts'

export class Main {
	static run(
		game: Game,
		players: Player[],
	): GameResults {
		const amountOfPlayers = players.length.toString()
		console.log('Running tournament with ' + amountOfPlayers + ' players')

		let totalResults: { [key: string]: number } = {}
		const numEpochs = 1000
		//const epochBatchSize = 10 // TODO: Group size should be configurable by the game developer
		const disqualified: string[] = []
		let activePlayers = [...players]

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			const epochString = (epoch + 1).toString()
			console.log('Running epoch ' + epochString)

			// Shuffle the active players
			// This might lead to issues, as the amount of times selected over the players will be normally distributed instead of uniform
			const shuffledPlayers = [...activePlayers].sort(() => Math.random() - 0.5)

			try {
				game.init(shuffledPlayers)

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
						console.log('Player ' + playerError.submissionId.toString() + ' disqualified: ' + error.message.toString())

						activePlayers = activePlayers.filter(
							player => player.submissionId !== playerError.submissionId
						)
						disqualified.push(playerError.submissionId)
					} else {
						console.log('Error executing player turn, no PlayerError thrown ' + error.toString())
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
			results: totalResults,
			disqualified: disqualified.length > 0 ? disqualified : undefined
		}
	}
}

export default Main
