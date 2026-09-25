import 'process'

import logger from './logger.js'

const envSecrets = [
	// Misc
	'BETTERSTACK_LOG_TOKEN',
	'NODE_ENV',
	'SENTRY_DSN',
	// Microservices
	'MICROSERVICE_AUTHORIZATION',
	// Code runner mode
	'RUNNER_MODE'
]

const envSecretsDev = [
	'NODE_ENV',
	'MICROSERVICE_AUTHORIZATION',
	'RUNNER_MODE'
]

const envSecretsTest = [
	'NODE_ENV',
	'MICROSERVICE_AUTHORIZATION',
	'RUNNER_MODE'
]

// Verify that all environment secrets are set
const missingSecrets = [] as string[]
if (process.env.NODE_ENV === 'development') {
	envSecretsDev.forEach((secret) => {
		if (process.env[secret] === undefined) {
			missingSecrets.push(secret)
		}
	})
} else if (process.env.NODE_ENV === 'test') {
	envSecretsTest.forEach((secret) => {
		if (process.env[secret] === undefined) {
			missingSecrets.push(secret)
		}
	})
} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
	envSecrets.forEach((secret) => {
		if (process.env[secret] === undefined) {
			missingSecrets.push(secret)
		}
	})
}

if (missingSecrets.length > 0) {
	logger.error(`Missing environment secrets: ${missingSecrets.join(', ')}`)
	logger.info('Exiting due to missing environment secrets')
	throw new Error(`Missing environment secrets: ${missingSecrets.join(', ')}`)
}

logger.info('All environment secrets are set')

export { }
