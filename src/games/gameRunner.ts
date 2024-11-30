/* eslint-disable local/enforce-comment-order */

import { Game, GameCallbacks, GameResult, Player, PlayerError } from './types'

export default async function main(game: Game, players: Player[], callbacks: GameCallbacks): Promise<GameResult> {
	try {
		game.init(players)

		for (let i = 0; i < players.length; i++) {
			try {
				await Promise.race([
					game.executePlayerTurn(),
					new Promise((_resolve, reject) => setTimeout(() => reject(new PlayerError('Player timed out')), 1000))
				])
			} catch (error) {
				if (error instanceof PlayerError) {
					callbacks.disqualifyPlayer(i)
				} else {
					throw error
				}
			}
		}

		return game.getResults()
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Game execution failed'
		}
	}
}
