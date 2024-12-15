// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runEvaluation } from '../services/gamerunner/CodeRunnerService.js'
import { isFileMap } from '../services/gamerunner/bundler.js'
import { gameFiles } from '../utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

export async function handleSubmissionEvaluation(req: Request, res: Response) {
	const { candidateSubmission, otherSubmissions } = req.body

	const candidateHasFiles = candidateSubmission && isFileMap(candidateSubmission.files)
	const othersHaveFiles = otherSubmissions?.length && otherSubmissions.every((strategy: { files: unknown }) => isFileMap(strategy.files))

	const candidateHasSubmissionId = candidateSubmission && candidateSubmission.submissionId
	const othersHaveSubmissionIds = otherSubmissions?.length && otherSubmissions.every((strategy: { submissionId: any }) => strategy.submissionId)

	if (!candidateHasFiles || !candidateHasSubmissionId) {
		return res.status(400).json({ error: 'Candidate is missing files or submission ID' })
	}

	if (!othersHaveFiles || !othersHaveSubmissionIds) {
		return res.status(400).json({ error: 'Other submissions are missing files or submission IDs' })
	}

	if (!Array.isArray(otherSubmissions)) {
		return res.status(400).json({ error: 'Other submissions must be an array' })
	}

	if (otherSubmissions.length === 0) {
		return res.status(400).json({ error: 'At least one other submission is required for evaluation' })
	}

	try {
		const result = await runEvaluation(gameFiles, candidateSubmission,otherSubmissions, 10) // Hardcoded batch size for now
		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
