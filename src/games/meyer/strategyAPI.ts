/* eslint-disable local/enforce-comment-order */
import { gameState } from './gameState'
import { StrategyAPI, DiePair, PlayerError } from './types'
import { calculateScore, rollDice } from './utils'

export function createStrategyAPI(playerIndex: number): StrategyAPI {
	const ensureTurnActive = () => {
		if (gameState.getCurrentPlayerIndex() !== playerIndex) {
			throw new PlayerError('It is not your turn.')
		}
	}

	return {
		calculateDieScore: (dice: DiePair) => calculateScore(dice),
		getPreviousActions: () => {
			ensureTurnActive()
			return gameState.getPreviousActions().map(action => action.announcedValue)
		},
		isFirstInRound: () => {
			ensureTurnActive()
			return gameState.isFirstInRound()
		},
		detEllerDerover: () => {
			ensureTurnActive()
			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('Cannot do "det eller derover" before rolling the dice.')
			}

			if (gameState.isFirstInRound()) {
				throw new PlayerError('Cannot do "det eller derover" as the first action in a round.')
			}

			gameState.removePreviousAction()

			const dice = rollDice()
			const score = calculateScore(dice)
			const previousAnnouncedValue = gameState.getPreviousActions()[0]?.announcedValue || 0

			gameState.addAction({
				type: 'detEllerDerover',
				value: score,
				playerIndex,
				announcedValue: previousAnnouncedValue
			})
			gameState.endTurn()
		},
		reveal: () => {
			ensureTurnActive()
			if (gameState.hasPlayerRolled()) {
				throw new PlayerError('Cannot reveal after rolling the dice.')
			}

			const prevPlayerIndex = gameState.getPrevPlayerIndex()
			const prevAction = gameState.getPreviousActions()[0]

			if (!prevAction) {
				throw new PlayerError('No previous action to reveal.')
			}

			const prevPlayerLied = prevAction.value !== prevAction.announcedValue

			if (prevPlayerLied) {
				gameState.penalizePlayer(prevPlayerIndex)
				gameState.setCurrentPlayerIndex(prevPlayerIndex)
			} else {
				gameState.penalizePlayer(playerIndex)
			}
			gameState.endRound()
		},
		roll: () => {
			ensureTurnActive()
			if (gameState.hasPlayerRolled()) {
				throw new PlayerError('You have already rolled the dice this turn.')
			}
			const dice = rollDice()
			const score = calculateScore(dice)
			gameState.addAction({
				type: 'roll',
				value: score,
				playerIndex,
				announcedValue: score
			})
			gameState.setHasRolled(true)
			return score
		},
		lie: (score: number) => {
			ensureTurnActive()
			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('You must roll before you can lie.')
			}
			const realValue = gameState.getPreviousActions()[0].value
			const lieValue = score

			gameState.addAction({
				type: 'lie',
				value: realValue,
				playerIndex,
				announcedValue: lieValue
			})
			gameState.endTurn()
		},
		endTurn: () => {
			ensureTurnActive()
			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('You must roll before you can end your turn.')
			}
			gameState.endTurn()
		}
	}
}
