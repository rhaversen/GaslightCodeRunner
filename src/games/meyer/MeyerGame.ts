/* eslint-disable local/enforce-comment-order */

import { Game, Player, GameResult } from '../types.js'
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
	}

	getResults(): GameResult {
		return gameState.getResults()
	}
}
