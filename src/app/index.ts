// Verify that all environment secrets are set
import './utils/verifyEnvironmentSecrets.js'

// Use Sentry
import './utils/instrument.js'

// Node.js built-in modules
import { createServer } from 'node:http'

// Third-party libraries
import * as Sentry from '@sentry/node'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

// Own modules
import globalErrorHandler from './middleware/globalErrorHandler.js'
import logger from './utils/logger.js'
import config from './utils/setupConfig.js'
import submissionRoutes from './routes/submissions.js'

// Environment variables
const { NODE_ENV } = process.env as Record<string, string>

// Config variables
const {
	expressPort,
	corsConfig,
} = config

// Destructuring and global variables
const app = express() // Create an Express application
const server = createServer(app) // Create an HTTP server

// Logging environment
logger.info(`Node environment: ${NODE_ENV}`)

// Middleware
app.use(helmet()) // Security headers
app.use(express.json()) // for parsing application/json

// Apply cors config to all routes
app.use(cors(corsConfig))

// Use all routes
app.use('/api/v1', submissionRoutes)

// Sentry error handler
Sentry.setupExpressErrorHandler(app)

// Global error handler middleware
app.use(globalErrorHandler)

// Listen
server.listen(expressPort, () => {
	logger.info(`Express is listening at http://localhost:${expressPort}`)
})

// Handle unhandled rejections outside middleware
process.on('unhandledRejection', (reason, promise): void => {
	// Attempt to get a string representation of the promise
	const promiseString = JSON.stringify(promise) !== '' ? JSON.stringify(promise) : 'a promise'

	// Get a detailed string representation of the reason
	const reasonDetail = reason instanceof Error ? reason.stack ?? reason.message : JSON.stringify(reason)

	// Log the detailed error message
	logger.error(`Unhandled Rejection at: ${promiseString}, reason: ${reasonDetail}`)

	shutDown().catch(error => {
		// If 'error' is an Error object, log its stack trace; otherwise, convert to string
		const errorDetail = error instanceof Error ? error.stack ?? error.message : String(error)
		logger.error(`An error occurred during shutdown: ${errorDetail}`)
		process.exit(1)
	})
})

// Handle uncaught exceptions outside middleware
process.on('uncaughtException', (err): void => {
	logger.error('Uncaught exception:', err)
	shutDown().catch(error => {
		logger.error('An error occurred during shutdown:', error)
		process.exit(1)
	})
})

// Shutdown function
export async function shutDown (): Promise<void> {
	logger.info('Closing server...')
	server.close()
	logger.info('Server closed')

	logger.info('Shutdown completed')
}

export { server }
export default app
