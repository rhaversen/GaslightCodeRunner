/* eslint-disable local/enforce-comment-order */

/**
 * Represents a game.
 * @property init - Initializes the game state with the provided players.
 * @property executePlayerTurn - Executes a single player's turn.
 * @property getResults - Returns the final results of the game. 
 * @description
 * A game is a class that manages the game state and executes player turns.
 * The game should be able to initialize the game state, execute player turns, and return the final results of the game.
 * The game should throw a PlayerError if a player's strategy contains invalid moves or actions.
 */
export interface Game {
	init(players: Player[]): void;
	playRound(): void;
	getResults(): GameResult;
}

/**
 * Represents the result of a game.
 * @description
 * A map of submission IDs to the player's final score. Score can be both positive and negative.
*/
export type GameResult = Map<string, number>;

/**
 * Represents a player's strategy function.
 * @description
 * A strategy function is a function that takes an API object as an argument and performs actions based on the game's rules.
 * The API object contains methods that allow the player to interact with the game state and other players.
 * The strategy function should throw a PlayerError if the player's actions are invalid and should not modify the game state directly.
 */
type Strategy<T = any> = (api: T) => void

/**
 * Represents a player in a game.
 * @property strategy - The player's strategy function.
 * @property submissionId - The unique identifier of the player's submission.
 */
export interface Player {
	strategy: Strategy
	submissionId: string
}
