import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Victim strategy for game-theft tests. VICTIM_SECRET_MARKER_7291 must never
// appear in any tournament result, disqualification record, or error message.
const main = (api: MeyerStrategyAPI) => {
	// VICTIM_SECRET_MARKER_7291: proprietary logic begins here
	if (api.isFirstInRound()) {
		api.roll()
		return
	}

	const lastScore = api.getPreviousAction()
	const currentScore = api.roll()

	if (lastScore === null || currentScore >= lastScore) {
		return
	}

	// VICTIM_SECRET_MARKER_7291: fallback announcement path
	api.detEllerDerover()
}

export default main
