/* eslint-disable local/enforce-comment-order */

import { CodeRunnerCallbacks, GameRunnerResult } from '../services/gamerunner/types'
import { Game, Player, PlayerError } from './types'

export default function main(game: Game, players: Player[], callbacks: CodeRunnerCallbacks): GameRunnerResult {
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

// Example usage:
// main(new MeyerGame(), [], { disqualifySubmission: () => {} })
