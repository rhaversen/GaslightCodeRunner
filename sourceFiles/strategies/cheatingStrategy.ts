/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../meyer/types.ts'

const main = (api: MeyerStrategyAPI) => {
	// Rolling twice is considered cheating
	api.roll()
	api.roll()
}

export default main
