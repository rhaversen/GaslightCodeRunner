/* eslint-disable local/enforce-comment-order */

export type DiePair = [number, number];
export type ActionType = 'detEllerDerover' | 'roll' | 'lie';

export interface Action {
	type: ActionType;
	value: number;
	announcedValue: number;
	playerIndex: number;
}

export interface MeyerStrategyAPI {
	/**
	 * @param dice - A pair of dice
	 * @returns The score of the dice
	 * @description
	 * Will always return the highest possible score for the given dice.
	 */
	calculateDieScore: (dice: DiePair) => number;
	/**
	 * @returns Array of newest to oldest previous actions
	 * @description
	 * Will only reveal the announced value (possible lie) of the previous actions.
	 * The value of the action is the calculated score of the dice.
	 */
	getPreviousActions: () => number[];
	/**
	 * @returns The previous action
	 * @description
	 * Will only reveal the announced value (possible lie) of the previous action.
	 * The value of the action is the calculated score of the dice.
	 */
	getPreviousAction: () => number;
	/**
	 * @param score - The score to round up
	 * @returns The rounded up score
	 * @description
	 * Rounds up the score to the nearest valid score.
	 */
	roundUpToValidScore: (score: number) => number;
	/**
	 * @returns Whether the player is the first in the round
	 */
	isFirstInRound: () => boolean;
	/**
	 * @description
	 * Ends the turn by rolling the dice while hiding the result from both the current player and the other players.
	 * The announced value will be the score of the previous action (Essentially betting that the hidden score is higher than or equal to the previous action).
	 * Can only be called once per turn and only if the player is not the first in the round. Can only be called after the player has rolled the dice.
	 */
	detEllerDerover: () => void;
	/**
	 * @description
	 * Ends the turn by revealing the previous action and penalizes the player who lied.
	 * If the previous player did not lie, the current player will be penalized.
	 * Can only be called once per turn and only if the player is not the first in the round. Can only be called after the player has rolled the dice.
	 */
	reveal: () => void;
	/**
	 * @returns The score of the dice
	 * @description
	 * Rolls the dice and returns the score of the dice. Can only be called once per turn.
	 */
	roll: () => number;
	/**
	 * @description
	 * Ends the turn by announcing a score and passing the turn to the next player.
	 * The lie value must be equal to or higher than the previously announced value.
	 * Can only be called once per turn. Can only be called after the player has rolled the dice.
	 */
	lie: (value: number) => void;
	/**
	 * @description
	 * Ends the turn and locks in the roll as the announced value.
	 * The announced value must be equal to or higher than the previously announced value.
	 */
	endTurn: () => void;
}
