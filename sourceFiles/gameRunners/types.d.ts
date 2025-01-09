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
	disqualified?: string[]
	strategyTimings?: Map<string, number[]>
	timedOutPlayers?: string[]
}

export interface EvaluationResults {
	error?: string
	results?: {
		candidate: number
		average: number
	},
	disqualified?: string
	strategyTimings?: number[]
}

export interface TournamentResults {
	error?: string
	results?: {
		[key: string]: number
	},
	disqualified?: string[]
	strategyTimings?: Map<string, number[]>
	timedOutPlayers?: string[]
}

export interface submission {
	submissionId: string
	files: FileMap
}
