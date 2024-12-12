/* eslint-disable local/enforce-comment-order */

import type { Game, Player } from '../commonTypes.d.ts'
import { gameState } from './gameState.ts'
import { createStrategyAPI } from './strategyAPI.ts'
import { PlayerError as GamePlayerError } from './types.ts'
import { PlayerError } from '../errors.ts'

export class Main implements Game {
	private players: Player[] = []
	private isRoundActive = true
	private turnCount = 0

	init(players: Player[]) {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	playRound() {
		do {
			this.turnCount++
			if (this.turnCount > 100) {
				// Prevent infinite loops
				this.isRoundActive = false
				break
			}

			const playerIndex = gameState.getCurrentPlayerIndex()
			const api = createStrategyAPI(playerIndex)
			try {
				this.players[playerIndex].strategy(api)
			} catch (error) {
				if (error instanceof GamePlayerError) {
					throw new PlayerError(error.message, this.players[playerIndex].submissionId)
				}
			}
			const canEndTurn = !gameState.isTurnActive() || gameState.hasPlayerRolled()
			if (!canEndTurn) {
				throw new PlayerError('You cannot return before your turn is over', this.players[playerIndex].submissionId)
			}
			const value = gameState.getPreviousActions()[0].announcedValue
			const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
			if (value < prevValue) {
				throw new PlayerError(`You must announce a higher value than the previous player. You rolled ${value}, and they rolled ${prevValue}`, this.players[playerIndex].submissionId)
			}

			// Check if the round is over
			// The game can run indefinitely, but we want to stop after a single round
			this.isRoundActive = gameState.isRoundActive() 

			// Reset
			gameState.prepareNextTurn()
		} while (this.isRoundActive)
	}

	getResults() {
		return gameState.getResults()
	}
}

export default Main
