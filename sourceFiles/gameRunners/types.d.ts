/* eslint-disable local/enforce-comment-order */

/**
 * Represents the result of a game.
 * @description
 * A map of submission IDs to the player's final score. Score can be both positive and negative.
*/
export interface GameResults {
	results?: { [key: string]: number }
	disqualified?: string[]
	error?: string
}

export interface EvaluationResults extends GameResults {
	results?: {
		candidate: number
		average: number
	}
	disqualified?: string[]
	error?: string
}

export interface TournamentResults extends GameResults {
	results?: {
		[key: string]: number
	}
	disqualified?: string[]
	error?: string
}

export interface submission {
	submissionId: string
	files: FileMap
}
