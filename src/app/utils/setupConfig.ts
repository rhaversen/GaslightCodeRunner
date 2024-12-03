// Node.js built-in modules

// Third-party libraries
import config from 'config'
import { type CorsOptions } from 'cors'

// Own modules
import logger from './logger.js'

// Environment variables

// Config variables

// Destructuring and global variables
const configString = JSON.stringify(config.util.toObject(config), null, 4)

// Log the configs used
logger.info(`Using configs:\n${configString}`)

const AppConfig = {
	expressPort: config.get('expressPort') as number,
	corsConfig: config.get('cors') as CorsOptions,
	mainServiceHost: config.get('microservices.mainService.host') as string,
}

export default AppConfig
