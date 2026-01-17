import config from 'config'
import { type CorsOptions } from 'cors'

import logger from './logger.js'

const configString = JSON.stringify(config.util.toObject(config), null, 4)

// Log the configs used
logger.info(`Using configs:\n${configString}`)

const AppConfig = {
	expressPort: config.get('expressPort') as number,
	corsConfig: config.get('cors') as CorsOptions,
	mainServiceHost: config.get('microservices.mainService.host') as string,
	tournamentEpochs: config.get('codeRunner.tournament.numEpochs') as number,
	evaluationEpochs: config.get('codeRunner.evaluation.numEpochs') as number,
	evaluationTimeout: config.get('codeRunner.evaluation.timeout') as number
}

export default AppConfig
