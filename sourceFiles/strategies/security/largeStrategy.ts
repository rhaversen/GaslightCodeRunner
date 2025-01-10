/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../../meyer/types.ts'

export default function (api: MeyerStrategyAPI) {
	// Generate large amount of code
	const padding = Array(100000).fill('// padding comment').join('\n')
	eval(padding) // attempt to execute the large string

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
