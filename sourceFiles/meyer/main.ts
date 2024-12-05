/* eslint-disable local/enforce-comment-order */

import type { Game, Player, GameResult } from '../commonTypes.d.ts'
import { gameState } from './gameState.ts'
import { createStrategyAPI } from './strategyAPI.ts'
import { PlayerError } from '../errors.ts'

export class Main implements Game {
	private players: Player[] = []

	init(players: Player[]): void {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	playRound() {
		do {
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
		} while (gameState.isRoundActive())
	}

	getResults(): GameResult {
		return gameState.getResults()
	}
}

export default Main