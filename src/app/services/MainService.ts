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
	avgExecutionTime: number;
}

interface DisqualifiedSubmission {
	submission: string;
	reason: string;
}

export async function createTournament(gradings: Grading[], disqualified: Record<string, string>, tournamentExecutionTime: number): Promise<boolean> {
	try {
		const disqualifiedArray: DisqualifiedSubmission[] = Object.entries(disqualified).map(([submission, reason]) => ({
			submission,
			reason
		}))

		await axios.post(`${mainServiceHost}/api/v1/microservices/tournament`, {
			gradings,
			disqualified: disqualifiedArray,
			tournamentExecutionTime
		}, {
			headers: {
				Authorization: `Bearer ${MICROSERVICE_AUTHORIZATION}`
			}
		})

		logger.info('Tournament created for submissions', {
			gradings: gradings.map(g => ({ submission: g.submission, score: g.score })),
			disqualified: disqualifiedArray,
			tournamentExecutionTime
		})

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

export async function getActiveSubmissions(excludeUser?: string): Promise<Array<submission> | undefined> {
	try {
		const params: Record<string, string> = {}

		if (excludeUser) {
			params.excludeUser = excludeUser // Pass user filter if provided
		}

		const response = await axios.get<submission[]>(`${mainServiceHost}/api/v1/microservices/submissions`, {
			headers: {
				Authorization: `Bearer ${MICROSERVICE_AUTHORIZATION}`
			},
			params, // Pass the dynamic query parameters
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
