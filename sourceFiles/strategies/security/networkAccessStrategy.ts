import { MeyerStrategyAPI } from '../../meyer/types.ts'

export default function (api: MeyerStrategyAPI) {
	// Try network access
	// @ts-ignore
	fetch('https://api.example.com').catch(() => {})

	// Normal gameplay
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
