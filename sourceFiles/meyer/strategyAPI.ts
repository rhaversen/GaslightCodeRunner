/* eslint-disable local/enforce-comment-order */
import { gameState } from './gameState.ts'
import { MeyerStrategyAPI, DiePair } from './types.ts'
import { calculateScore, isValidScore, rollDice, roundUpToValidScore } from './utils.ts'
import { PlayerError } from '../errors.ts'

export function createStrategyAPI(playerIndex: number): MeyerStrategyAPI {
	const ensureTurnActive = () => {
		if (!gameState.isTurnActive()) {
			throw new PlayerError('You cannot perform any more actions this turn.')
		}
	}

	return {
		calculateDieScore: (dice: DiePair) => calculateScore(dice),
		getPreviousActions: () => {
			ensureTurnActive()
			return gameState.getPreviousActions().map(action => action.announcedValue)
		},
		getPreviousAction: () => {
			ensureTurnActive()
			return gameState.getPreviousActions()[0]?.announcedValue
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

			// TODO: Dont add the roll to the actions immediatly. Only add action when turn is ended. Currently, calling roll and then getLatestAction will return the roll action, not the previous player's action.
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

			const lieValue = score
			const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
			const realValue = gameState.getPreviousActions()[0].value

			if (!isValidScore(lieValue)) {
				throw new PlayerError('Invalid lie value.')
			}

			if (lieValue <= prevValue) {
				throw new PlayerError('You must announce a higher value than the previous player.')
			}

			gameState.addAction({
				type: 'lie',
				value: realValue,
				playerIndex,
				announcedValue: lieValue
			})
			gameState.endTurn()
		}
	}
}
