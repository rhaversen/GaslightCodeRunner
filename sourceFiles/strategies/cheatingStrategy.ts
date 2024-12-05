/* eslint-disable local/enforce-comment-order */
import { MeyerStrategyAPI } from '../meyer/types.ts'

const main = (api: MeyerStrategyAPI) => {
	api.roll()
	api.roll()
}

export default main
