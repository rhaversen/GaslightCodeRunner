// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runGame } from '../services/gamerunner/CodeRunnerService.js'
import { getSubmissions } from '../services/MainService.js'
import { isFileMap } from '../services/gamerunner/bundler.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function evaluateSubmission(req: Request, res: Response) {
	const { code } = req.body

	if (!code || !isFileMap(code)) {
		return res.status(400).json({ error: 'Invalid input parameters' })
	}

	const strategies = await getSubmissions()

	if (!strategies || !strategies.every(isFileMap)) {
		return res.status(500).json({ error: 'Invalid submission format' })
	}

	try {
		const result = await runGame(code, strategies, 'Evaluation')
		res.json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
