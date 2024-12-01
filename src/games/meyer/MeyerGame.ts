/* eslint-disable local/enforce-comment-order */

import { Game, Player, GameResult, PlayerError } from '../types.js'
import { gameState } from './gameState.js'
import { createStrategyAPI } from './strategyAPI.js'

export class MeyerGame implements Game {
	private players: Player[] = []

	init(players: Player[]): void {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	executePlayerTurn(): void {
		const playerIndex = gameState.getCurrentPlayerIndex()
		const api = createStrategyAPI(playerIndex)
		this.players[playerIndex].strategy(api)
		if (!gameState.hasPlayerRolled()) {
			throw new PlayerError('You must roll before you can end your turn.')
		}
		const value = gameState.getPreviousActions()[0].announcedValue
		const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
		if (value <= prevValue) {
			throw new PlayerError('You must announce a higher value than the previous player.')
		}

		// Reset
		gameState.prepareNextPlayer()
	}

	getResults(): GameResult {
		return gameState.getResults()
	}
}
