/* eslint-disable typescript/no-unused-vars */
/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../../meyer/types.ts'

export default function (api: MeyerStrategyAPI) {
	try {
		const arr = new Array(1000000000).fill(0)
		arr.length // prevent optimization
	} catch (_e) {
		console.warn('Memory allocation failed')
	}

	if (api.isFirstInRound()) {
		return api.roll()
	}

	const prevScore = api.getPreviousAction()
	const currentScore = api.roll()
    
	if (prevScore === null || currentScore >= prevScore) {
		return
	}
	api.lie(prevScore)
}
