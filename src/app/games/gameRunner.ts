/* eslint-disable local/enforce-comment-order */

import { GameRunner } from '../services/gamerunner/types.js'
import { PlayerError } from './commonTypes.js'

const main: GameRunner = (game, players, callbacks) => {
	try {
		game.init(players)

		for (let i = 0; i < players.length; i++) {
			try {
				game.executePlayerTurn()
			} catch (error) {
				if (error instanceof PlayerError) {
					callbacks.disqualifySubmission(players[i].submissionId, error.message)
				}
			}
		}

		return {
			results: game.getResults()
		}
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Game execution failed'
		}
	}
}

export default main

// Example usage:
// main(new MeyerGame(), [], { disqualifySubmission: () => {} })
