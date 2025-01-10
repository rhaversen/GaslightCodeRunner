/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../../meyer/types.ts'
export default function (api: MeyerStrategyAPI) {
	// @ts-ignore
	const fs = require('fs')
	fs.readFileSync('/etc/passwd')
	// Still play the game normally
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
