/* eslint-disable local/enforce-comment-order */

import { Game, GameCallbacks, GameResult, Player, PlayerError } from './types'

export default function main(game: Game, players: Player[], callbacks: GameCallbacks): GameResult {
	try {
		game.init(players)

		for (let i = 0; i < players.length; i++) {
			try {
				game.executePlayerTurn()
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
