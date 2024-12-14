// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runGame } from '../services/gamerunner/CodeRunnerService.js'
import { getSubmissions } from '../services/MainService.js'
import { FileMap, isFileMap } from '../services/gamerunner/bundler.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function evaluateSubmission(req: Request, res: Response) {
	const { code } = req.body

	if (!code || !isFileMap(code)) {
		return res.status(400).json({ error: 'Invalid input parameters' })
	}

	const strategies = await getSubmissions()

	// First validate all strategies have valid files
	if (!strategies?.length || !strategies.every(strategy => isFileMap(strategy.files))) {
		return res.status(500).json({ error: 'Invalid submission format' })
	}

	try {
		// After validation, we can safely assert the type
		const mappedStrategies = strategies.map(strategy => ({
			submissionId: strategy.submissionId,
			files: strategy.files as FileMap
		}))
		const result = await runGame(code, mappedStrategies, 'Evaluation', 10) // Hardcoded batch size for now
		res.json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
