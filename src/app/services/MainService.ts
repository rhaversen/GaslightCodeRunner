// Node.js built-in modules

// Third-party libraries
import axios from 'axios'

// Own modules
import logger from '../utils/logger.js'
import AppConfig from '../utils/setupConfig.js'
import { FileMap } from './gamerunner/bundler.js'

// Environment variables
const { MICROSERVICE_AUTHORIZATION } = process.env as Record<string, string>

// Config variables
const {
	mainServiceHost
} = AppConfig

// Destructuring and global variables

export async function createGradingForSubmission(score: number, submissionId: string): Promise<Object | undefined> {
	try {
		const response = await axios.post(`http://${mainServiceHost}/api/v1/microservices/grading`, {
			score,
			submission: submissionId,
		}, {
			headers: {
				authorization: MICROSERVICE_AUTHORIZATION
			}
		})

		logger.info('Grading submitted for submission', submissionId)

		return response.data
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Error submitting grading', { error: error.message })
		} else {
			logger.error('Error submitting grading', { error: String(error) })
		}

		return undefined
	}
}

export async function getSubmissions(): Promise<Array<{ submissionId: string, files: FileMap }> | undefined> {
	try {
		const response = await axios.get(`http://${mainServiceHost}/api/v1/microservices/submissions`, {
			headers: {
				authorization: MICROSERVICE_AUTHORIZATION
			},
		})

		return response.data
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Error getting submissions', { error: error.message })
		} else {
			logger.error('Error getting submissions', { error: String(error) })
		}

		return undefined
	}
}
