// Node.js built-in modules

// Third-party libraries
import axios from 'axios'

// Own modules
import logger from '../utils/logger.js'
import AppConfig from '../utils/setupConfig.js'
import { submission } from './gamerunner/CodeRunnerService.js'

// Environment variables
const { MICROSERVICE_AUTHORIZATION } = process.env as Record<string, string>

// Config variables
const {
	mainServiceHost
} = AppConfig

// Destructuring and global variables

interface Grading {
    submission: string;
    score: number;
}

export async function createTournamen(gradings: Grading[], disqualified: string[], error: string): Promise<boolean> {
	try {
		await axios.post(`${mainServiceHost}/api/v1/microservices/tournament`, {
			gradings,
			disqualified
		}, {
			headers: {
				Authorization: `Bearer ${MICROSERVICE_AUTHORIZATION}`
			}
		})

		logger.info('Tournament created for submissions', { gradings, disqualified, error })

		return true
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Error creating tournament', { error: error.message })
		} else {
			logger.error('Error creating tournament', { error: String(error) })
		}

		return false
	}
}

export async function getActiveSubmissions(): Promise<Array<submission> | undefined> {
	try {
		const response = await axios.get<submission[]>(`${mainServiceHost}/api/v1/microservices/submissions`, {
			headers: {
				Authorization: `Bearer ${MICROSERVICE_AUTHORIZATION}`
			}
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
