import { MeyerStrategyAPI } from '../../meyer/types.ts'
export default function (api: MeyerStrategyAPI) {
	// @ts-ignore
	process.exit(0)
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
