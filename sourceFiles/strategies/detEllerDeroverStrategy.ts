/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../meyer/types.ts'

const main = (api: MeyerStrategyAPI) => {
	// If we're first in the round, we need to roll
	if (api.isFirstInRound()) {
		api.roll()
		return
	}

	// We always call 'det eller derover'
	api.detEllerDerover()
}

export default main
