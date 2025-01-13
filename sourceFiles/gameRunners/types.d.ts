/* eslint-disable local/enforce-comment-order */

// From the VM
export interface VMResults {
	error?: string // Game error
	results?: Record<string, number> // Results
	disqualified?: Record<string, string> // SubmissionId -> error
}

// From RunGame
export interface GameResults {
	error?: string
	results?: Record<string, number> // submissionId -> score
	disqualified: Record<string, string> // submissionId -> error
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}

// From RunEvaluation
export interface EvaluationResults {
	error?: string
	results?: {
		candidate: number // Candidate's average
		average: number // Total average of other players
	},
	disqualified: string | null // Error or null
	strategyExecutionTimings: number[] // Timings
	strategyLoadingTimings: number // Timings
}

// From RunTournament
export interface TournamentResults {
	error?: string
	results?: Record<string, number> // submissionId -> score
	disqualified: Record<string, string> // submissionId -> error
	strategyExecutionTimings: Record<string, number[]> // submissionId -> timings
	strategyLoadingTimings: Record<string, number> // submissionId -> timings
}

export interface submission {
	submissionId: string
	files: FileMap
}
