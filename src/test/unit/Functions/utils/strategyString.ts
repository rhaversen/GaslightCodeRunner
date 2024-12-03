/* eslint-disable local/enforce-comment-order */

const files = {
	'main.ts': `
	const main: Strategy<MeyerStrategyAPI> = (api) => {
		// If we're first in the round, we need to roll
		if (api.isFirstInRound()) {
			api.roll()
			return
		}

		// Get previous announced value
		const lastScore = api.getPreviousAction()

		// Roll the dice
		const currentScore = api.roll()

		// If our score is higher or equal, finish the turn
		if (currentScore >= lastScore) {
			return
		}

		// If our score is lower, we can either lie or call "det eller derover"
		if (Math.random() > 0.5) {
			api.lie(api.roundUpToValidScore(lastScore + 1))
		} else {
			api.detEllerDerover()
		}
	}

	export default main
`, 'commonTypes.ts': `
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
		executePlayerTurn(): void;
		getResults(): GameResult;
	}
	
	/**
	 * Represents a player's strategy function.
	 * @description
	 * A strategy function is a function that takes an API object as an argument and performs actions based on the game's rules.
	 * The API object contains methods that allow the player to interact with the game state and other players.
	 * The strategy function should throw a PlayerError if the player's actions are invalid and should not modify the game state directly.
	 */
	export type Strategy<T = any> = (api: T) => void
	
	/**
	 * Represents the result of a game.
	 * @description
	 * A map of submission IDs to the player's final score. Score can be both positive and negative.
	 */
	export type GameResult = Map<string, number>;
	
	/**
	 * Represents a player in a game.
	 * @property strategy - The player's strategy function.
	 * @property submissionId - The unique identifier of the player's submission.
	 */
	export interface Player {
		strategy: Strategy
		submissionId: string
	}
	
	/**
	 * Error thrown when a player's strategy contains an invalid move or action.
	 * @description
	 * Indicates that a strategy function contains critical logical errors that prevent game progression.
	 * The affected submission will be disqualified and excluded from subsequent rounds until corrected.
	 * The error should be thrown by the game when
	 */
	export class PlayerError extends Error {
		constructor(message: string) {
			super(message)
			this.name = 'PlayerError'
		}
	}
`, 'types.ts': `
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
		 * Revealing a true "Meyer" score will cause double penalty to the revealing player. Revealing a false "Meyer" score will cause double penalty to the liar (Previous player).
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
		 * The lie value must be equal to or higher than the previously announced value. Lying about "Meyer" score will cause double penalty if caught.
		 * Can only be called once per turn. Can only be called after the player has rolled the dice.
		 */
		lie: (value: number) => void;
	}
`
}

export default files