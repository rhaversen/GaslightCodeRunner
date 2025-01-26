/* eslint-disable local/enforce-comment-order */

/**
 * Error thrown when a player's strategy contains an invalid move or action.
 * @description
 * Indicates that a strategy function contains critical logical errors that prevent game progression.
 * The affected submission will be disqualified and excluded from subsequent rounds until corrected.
 * The error should be thrown by the game when
 */
export class PlayerError extends Error {
	submissionId: string
	constructor(message: string, submissionId: string) {
		super(message)
		this.name = 'PlayerError'
		this.submissionId = submissionId
	}
}
