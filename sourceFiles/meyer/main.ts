/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { gameState } from './gameState.ts'
import { createStrategyAPI } from './strategyAPI.ts'
import { PlayerError as GamePlayerError } from './types.ts'
import { PlayerError } from '../errors.ts'

export class Main implements Game {
	private players: Player[] = []

	init(players: Player[]) {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	playRound() {
		do {
			const playerIndex = gameState.getCurrentPlayerIndex()
			const api = createStrategyAPI(playerIndex)
			try {
				this.players[playerIndex].strategy(api)
			} catch (error) {
				if (error instanceof GamePlayerError) {
					throw new PlayerError(error.message, this.players[playerIndex].submissionId)
				}
			}
			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('You must roll before you can end your turn.', this.players[playerIndex].submissionId)
			}
			const value = gameState.getPreviousActions()[0].announcedValue
			const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
			if (value <= prevValue) {
				throw new PlayerError('You must announce a higher value than the previous player.', this.players[playerIndex].submissionId)
			}

			// Reset
			gameState.prepareNextPlayer()
		} while (gameState.isRoundActive())
	}

	getResults() {
		return gameState.getResults()
	}
}

export default Main
