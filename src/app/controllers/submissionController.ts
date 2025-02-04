// Node.js built-in modules

// Third-party libraries
import { Request, Response } from 'express'

// Own modules
import { runEvaluation } from '../services/gamerunner/CodeRunnerService.js'
import { isFileMap } from '../services/gamerunner/bundler.js'
import { gameFiles } from '../utils/sourceFiles.js'
import { getActiveSubmissions } from '../services/MainService.js'

// Environment variables

// Config variables

// Destructuring and global variables

function calculatePercentile(numbers: number[], percentile: number): number {
	const sorted = [...numbers].sort((a, b) => a - b)
	const index = Math.ceil((percentile / 100) * sorted.length) - 1
	return sorted[index]
}

function filterByPercentile(timings: number[], percentile: number): number[] {
	if (!timings || timings.length === 0) return []
	const p95 = calculatePercentile(timings, percentile)
	return timings.filter(timing => timing <= p95)
}

function calculateAverage(numbers: number[]): number {
	if (!numbers || numbers.length === 0) return 0
	return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

export async function handleSubmissionEvaluation(req: Request, res: Response) {
	const { candidateSubmission, excludeUser } = req.body

	const otherSubmissions = await getActiveSubmissions(excludeUser ? String(excludeUser) : undefined)

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
		const evaluationResult = await runEvaluation(gameFiles, candidateSubmission, otherSubmissions, 10) // Hardcoded batch size for now

		// Filter and check execution timings
		const executionTimings = evaluationResult.strategyExecutionTimings
		const filteredTimings = executionTimings ? filterByPercentile(executionTimings, 95) : null
		const averageExecutionTime = filteredTimings?.length ? calculateAverage(filteredTimings) : null

		// Thin out timings for the frontend
		const timingsToKeep = 100
		const thinnedExecutionTimings = executionTimings
			? executionTimings.filter((_, index) => index % Math.max(Math.floor(executionTimings.length / timingsToKeep), 1) === 0)
			: null

		const result = {
			results: {
				candidate: evaluationResult.results?.candidate ?? 0,
				average: evaluationResult.results?.average ?? 0
			},
			disqualified: evaluationResult.disqualified,
			strategyLoadingTimings: evaluationResult.strategyLoadingTimings,
			strategyExecutionTimings: thinnedExecutionTimings,
			averageExecutionTime: averageExecutionTime
		}

		res.status(200).json(result)
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' })
	}
}
