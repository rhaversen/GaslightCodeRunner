/* eslint-disable local/enforce-comment-order */
import { gameState } from './gameState.ts'
import { MeyerStrategyAPI, DiePair, PlayerError } from './types.ts'
import { calculateScore, isValidScore, rollDice, roundUpToValidScore } from './utils.ts'

export function createStrategyAPI(playerIndex: number): MeyerStrategyAPI {
	const ensureTurnActive = () => {
		if (!gameState.isTurnActive()) {
			throw new PlayerError('You cannot perform any more actions this turn. Calling \'det eller derover\' or \'reveal\' will end your turn.')
		}
	}

	return {
		calculateDieScore: (dice: DiePair) => calculateScore(dice),
		getPreviousActions: () => {
			ensureTurnActive()
			const actions = gameState.getRoundActions()
			if (actions.length === 0) {
				return null
			}
			return actions.map(action => action.announcedValue)
		},
		getPreviousAction: () => {
			ensureTurnActive()
			const actions = gameState.getRoundActions()
			if (actions.length === 0) {
				return null
			}
			return actions[0].announcedValue
		},
		roundUpToValidScore: (score: number) => roundUpToValidScore(score),
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

			const dice = rollDice()
			const score = calculateScore(dice)
			const previousAnnouncedValue = gameState.getRoundActions()[0].announcedValue

			gameState.addTurnAction({
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
			const prevAction = gameState.getRoundActions()[0]

			if (!prevAction) {
				throw new PlayerError('No previous action to reveal.')
			}

			const prevPlayerLied = prevAction.value < prevAction.announcedValue // Doing 'det eller derover' while not scoring that or higher is considered lying
			const prevAnnouncedValueIsMeyer = prevAction.announcedValue === 1000
			const prevValueIsMeyer = prevAction.value === 1000

			if (prevPlayerLied) {
				if (prevAnnouncedValueIsMeyer) {
					gameState.doublePenalizePlayer(prevPlayerIndex)
				} else {
					gameState.penalizePlayer(prevPlayerIndex)
				}
			} else {
				if (prevValueIsMeyer) {
					gameState.doublePenalizePlayer(playerIndex)
				} else {
					gameState.penalizePlayer(playerIndex)
				}
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
			gameState.addTurnAction({
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

			const lieValue = score
			const realValue = gameState.getTurnActions()[0].value
			const prevTurnValue = gameState.getRoundActions()[0]?.announcedValue || 0

			if (!isValidScore(lieValue)) {
				throw new PlayerError(`Invalid lie value. You announced ${lieValue}`)
			}

			if (lieValue < prevTurnValue) { // Must announce a higher value than the previous player
				throw new PlayerError(`You must announce a higher value than the previous player. You lied with ${lieValue}, and they announced ${prevValue}`)
			}

			gameState.addTurnAction({
				type: 'lie',
				value: realValue,
				playerIndex,
				announcedValue: lieValue
			})
			gameState.endTurn()
		}
	}
}
