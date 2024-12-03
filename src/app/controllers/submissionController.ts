// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runGame } from '../services/gamerunner/CodeRunnerService.js'
import { getSubmissions } from '../services/MainService.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function gradeSubmission(req: Request, res: Response) {
	const { code } = req.body

	if (!code || typeof code !== 'object' || !Object.values(code).every(value => typeof value === 'string')) {
		return res.status(400).json({ error: 'Invalid input parameters' })
	}

	
	const strategies = await getSubmissions()

	if (!strategies) {
		return res.status(500).json({ error: 'Failed to get submissions' })
	}

	try {
		const result = await runGame(code, strategies)
		res.json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
