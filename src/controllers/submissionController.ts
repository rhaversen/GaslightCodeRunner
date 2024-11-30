// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'
import { runGame } from '../services/gamerunner/CodeRunnerService'

// Own modules

// Environment variables

// Config variables

// Destructuring and global variables

export async function gradeSubmission(req: Request, res: Response) {
	const { code } = req.body

	if (!code || typeof code !== 'string') {
		return res.status(400).json({ error: 'Invalid input parameters' })
	}

	const strategies = ['player1', 'player2'] //TODO: Get strategies from database

	try {
		const result = await runGame(code, strategies)
		res.json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
