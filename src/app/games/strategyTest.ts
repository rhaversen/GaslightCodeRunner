/* eslint-disable local/enforce-comment-order */
import { Strategy } from './commonTypes.js'
import { MeyerStrategyAPI } from './meyer/types.js'

export const myStrategy: Strategy<MeyerStrategyAPI> = (api) => {
	// If we're first in the round, we need to roll
	if (api.isFirstInRound()) {
		api.roll()
		return
	}

	// Get previous announced value
	const lastScore = api.getPreviousAction()

	// Roll the dice
	const currentScore = api.roll()

	// If our score is higher or equal, finish the turn
	if (currentScore >= lastScore) {
		return
	}

	// If our score is lower, we can either lie or call "det eller derover"
	if (Math.random() > 0.5) {
		api.lie(api.roundUpToValidScore(lastScore + 1))
	} else {
		api.detEllerDerover()
	}
}
