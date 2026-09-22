import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Theft attempt #5: turn stealing. Keep the api object from our first turn
// alive and try to use it again later — acting outside our own turn would
// let a strategy watch other players' rolls and react to game state it
// should not see.
let savedApi: MeyerStrategyAPI | null = null

const main = (api: MeyerStrategyAPI) => {
	if (savedApi !== null) {
		// Second turn: reuse the STALE api from turn one to read state and
		// attempt actions — must be rejected by the ownership check.
		try {
			const actions = savedApi.getPreviousActions()
			throw new Error(`STALE_API_WORKED:${JSON.stringify(actions)}`)
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e)
			if (msg.startsWith('STALE_API_WORKED')) {
				throw e
			}
			// The stale api rejected us as expected — play on normally.
		}
	}

	if (api.isFirstInRound()) {
		api.roll()
		// Keep the api around; after endTurn its turn is over.
		savedApi = api
		return
	}

	const lastScore = api.getPreviousAction()
	const currentScore = api.roll()
	if (lastScore === null || currentScore >= lastScore) {
		return
	}
	api.detEllerDerover()
}

export default main
