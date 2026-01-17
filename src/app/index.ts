// Verify that all environment secrets are set
import './utils/verifyEnvironmentSecrets.js'

// Use Sentry
import './utils/instrument.js'

import { createServer } from 'node:http'

import * as Sentry from '@sentry/node'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import globalErrorHandler from './middleware/globalErrorHandler.js'
import submissionRoutes from './routes/submissions.js'
import serviceRoutes from './routes/service.js'
import { runTournament } from './services/gamerunner/CodeRunnerService.js'
import { getActiveSubmissions, createTournament, getGames } from './services/MainService.js'
import logger from './utils/logger.js'
import config from './utils/setupConfig.js'

// Environment variables
const { NODE_ENV, RUNNER_MODE } = process.env as Record<string, string>

// Config variables
const {
	expressPort,
	corsConfig
} = config

// Destructuring and global variables
const app = express() // Create an Express application
const server = createServer(app) // Create an HTTP server

// Logging environment
logger.info(`Node environment: ${NODE_ENV}`)

// Trust proxy settings
app.set('trust proxy', 1) // Trust the first proxy (NGINX)

// Middleware
app.use(helmet()) // Security headers
app.use(express.json()) // for parsing application/json

// Apply cors config to all routes
app.use(cors(corsConfig))

// Use all routes
app.use('/api/v1', submissionRoutes)
app.use('/api/service', serviceRoutes)

// Sentry error handler
Sentry.setupExpressErrorHandler(app)

// Global error handler middleware
app.use(globalErrorHandler)

if (RUNNER_MODE === 'evaluation') {
	// Start server only in evaluation mode
	server.listen(expressPort, () => {
		logger.info(`Express is listening at http://localhost:${expressPort}`)
	})
} else if (RUNNER_MODE === 'tournament') {
	// Run tournament and exit
	logger.info('Starting tournament mode')
	try {
		const games = await getGames()

		if (games == null || games.length === 0) {
			logger.error('No games found')
			process.exit(1)
			return
		}

		// Run tournament for each game
		for (const game of games) {
			const submissions = await getActiveSubmissions(game.id)
			if (submissions == null || submissions.length === 0) {
				logger.info('No active submissions found')
				continue
			}

			const results = await runTournament(game.gameFiles, submissions, game.batchSize)
			if (results.error !== undefined) {
				logger.error('Tournament error:', results.error)
				process.exit(1)
				return
			}

			const gradings = Object.entries(results.results ?? {}).map(([submissionId, score]) => ({
				submission: submissionId,
				score,
				avgExecutionTime: results.strategyExecutionTimings[submissionId].reduce((a, b) => a + b, 0) / results.strategyExecutionTimings[submissionId].length
			}))

			await createTournament(gradings, results.disqualified ?? {}, results.tournamentExecutionTime, game.id)
		}

		// Wait 1 second before exiting
		await new Promise(resolve => setTimeout(resolve, 1000))

		process.exit(0)
	} catch (error) {
		logger.error('Tournament process failed:', error)

		// Wait 1 second before exiting
		await new Promise(resolve => setTimeout(resolve, 1000))
		process.exit(1)
	}
} else {
	logger.error('Invalid RUNNER_MODE specified')

	// Wait 1 second before exiting
	await new Promise(resolve => setTimeout(resolve, 1000))
	process.exit(1)
}

// Handle unhandled rejections outside middleware
process.on('unhandledRejection', async (reason, promise): Promise<void> => {
	const errorMessage = reason instanceof Error ? reason.message : String(reason)
	logger.error(`Unhandled Rejection: ${errorMessage}`, { reason, promise })
	if (NODE_ENV !== 'test') {
		// eslint-disable-next-line n/no-process-exit
		process.exit(1) // Exit the process with failure code
	}
})

// Handle uncaught exceptions outside middleware
process.on('uncaughtException', async (err): Promise<void> => {
	logger.error('Uncaught exception', { error: err })
	if (NODE_ENV !== 'test') {
		// eslint-disable-next-line n/no-process-exit
		process.exit(1) // Exit the process with failure code
	}
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
