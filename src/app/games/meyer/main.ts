/* eslint-disable local/enforce-comment-order */

import { Game, Player, GameResult, PlayerError } from '../commonTypes.js'
import { gameState } from './gameState.js'
import { createStrategyAPI } from './strategyAPI.js'

export class Main implements Game {
	private players: Player[] = []

	init(players: Player[]): void {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	// TODO: Investigate how to handle different types of games, and how to control a game iteration. Some games are single player games and should be run until completion, while others are multiplayer games and should be run in turns.
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
