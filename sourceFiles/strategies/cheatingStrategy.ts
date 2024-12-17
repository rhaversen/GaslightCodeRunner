/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../meyer/types.ts'

const main = (api: MeyerStrategyAPI) => {
	// Rolling after revealing is considered cheating
	api.reveal()
	api.roll()
}

export default main
