/* eslint-disable local/enforce-comment-order */

export interface EvaluationExecutionResults {
	results?: { candidate: number, average: number }
	disqualified?: string[]
	error?: string
}

export interface TournamentExecutionResults {
	results?: { [key: string]: number }
	disqualified?: string[]
	error?: string
}

export interface GameResults {
	error?: string
	results?: {
		[key: string]: number
	},
	disqualified: string[]
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}

export interface EvaluationResults {
	error?: string
	results?: {
		candidate: number
		average: number
	},
	disqualified: string
	strategyExecutionTimings: number[] // Timings
	strategyLoadingTimings: number // Timings
}

export interface TournamentResults {
	error?: string
	results?: {
		[key: string]: number
	},
	disqualified: string[]
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}

export interface submission {
	submissionId: string
	files: FileMap
}
