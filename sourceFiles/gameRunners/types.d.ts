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

/**
 * Represents the logging interface for the game.
 * @property applySync - Logs a message synchronously.
*/
export interface GameLog {
	apply: (thisArg: undefined, args: string[]) => void
}