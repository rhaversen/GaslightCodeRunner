// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runGame } from '../services/gamerunner/CodeRunnerService.js'
import { getSubmissions } from '../services/MainService.js'
import { isFileMap } from '../services/gamerunner/bundler.js'
import { gameFiles } from '../utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function handleSubmissionEvaluation(req: Request, res: Response) {
	const { submissionCode, submissionId } = req.body

	if (!submissionCode || !isFileMap(submissionCode)) {
		return res.status(400).json({ error: 'Invalid submission format' })
	}

	const strategies = await getSubmissions()

	// First validate all strategies have valid files
	if (!strategies?.length || !strategies.every(strategy => isFileMap(strategy.files))) {
		return res.status(500).json({ error: 'Invalid strategies format' })
	}

	try {
		const submission = {
			submissionId,
			files: submissionCode
		}
		const result = await runGame(gameFiles, [submission, ...strategies], 'Evaluation', 10) // Hardcoded batch size for now
		res.json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
