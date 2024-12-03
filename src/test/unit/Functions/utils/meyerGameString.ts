/* eslint-disable local/enforce-comment-order */

const files = {
	'commonTypes.ts': `
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
`, 'gameState.ts': `
import { GameResult } from './commonTypes.ts'
import { Action } from './types.ts'
import { Scoring } from './utils.ts'

class GameState {
	private static instance: GameState
	private previousActions: Action[] = []
	private firstInRound = true
	private currentPlayerIndex = 0
	private amountOfPlayers = 0
	private hasRolled = false
	private scoring?: Scoring
	private turnActive = true
	private roundActive = true

	static getInstance(): GameState {
		if (!GameState.instance) {
			GameState.instance = new GameState()
		}
		return GameState.instance
	}

	init(ids: string[]) {
		this.amountOfPlayers = ids.length
		this.scoring = new Scoring(ids)
	}

	addAction(action: Action): void {
		this.previousActions.unshift(action)
	}

	penalizePlayer(playerIndex: number): void {
		this.scoring?.penalize(playerIndex, 1)
	}

	doublePenalizePlayer(playerIndex: number): void {
		this.scoring?.penalize(playerIndex, 2)
	}

	// Getters and setters
	getPreviousActions(): Action[] {
		return [...this.previousActions]
	}

	removePreviousAction(): void {
		this.previousActions.shift()
	}

	isFirstInRound(): boolean {
		return this.firstInRound
	}

	getCurrentPlayerIndex(): number {
		return this.currentPlayerIndex
	}

	getPrevPlayerIndex(): number {
		return (this.currentPlayerIndex - 1 + this.amountOfPlayers) % this.amountOfPlayers
	}

	hasPlayerRolled(): boolean {
		return this.hasRolled
	}

	setHasRolled(value: boolean): void {
		this.hasRolled = value
	}

	incrementCurrentPlayerIndex(): void {
		this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.amountOfPlayers
	}

	endTurn(): void {
		this.turnActive = false
	}

	endRound(): void {
		this.turnActive = false
		this.roundActive = false
	}

	isTurnActive(): boolean {
		return this.turnActive
	}

	prepareNextPlayer(): void {
		if (this.roundActive) {
			this.firstInRound = false
		} else {
			this.firstInRound = true
			this.previousActions = []
			this.roundActive = true
		}
		this.hasRolled = false
		this.turnActive = true
		this.incrementCurrentPlayerIndex()
	}

	getResults(): GameResult {
		return this.scoring?.getScores() || new Map<string, number>()
	}
}

export const gameState = GameState.getInstance()
`, 'main.ts': `
import { Game, Player, GameResult, PlayerError } from './commonTypes.ts'
import { gameState } from './gameState.ts'
import { createStrategyAPI } from './strategyAPI.ts'

export class Main implements Game {
	private players: Player[] = []

	init(players: Player[]): void {
		gameState.init(players.map(player => player.submissionId))
		this.players = players
	}

	// TODO: Investigate how to handle different types of games, and how to control a game iteration. Some games are single player games and should be run until completion, while others are multiplayer games and should be run in turns.
	executePlayerTurn(): void {
		const playerIndex = gameState.getCurrentPlayerIndex()
		const api = createStrategyAPI(playerIndex)
		this.players[playerIndex].strategy(api)
		if (!gameState.hasPlayerRolled()) {
			throw new PlayerError('You must roll before you can end your turn.')
		}
		const value = gameState.getPreviousActions()[0].announcedValue
		const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
		if (value <= prevValue) {
			throw new PlayerError('You must announce a higher value than the previous player.')
		}

		// Reset
		gameState.prepareNextPlayer()
	}

	getResults(): GameResult {
		return gameState.getResults()
	}
}
`, 'strategyAPI.ts': `
import { gameState } from './gameState'
import { MeyerStrategyAPI, DiePair } from './types.ts'
import { calculateScore, isValidScore, rollDice, roundUpToValidScore } from './utils.ts'
import { PlayerError } from './commonTypes.ts'

export function createStrategyAPI(playerIndex: number): MeyerStrategyAPI {
	const ensureTurnActive = () => {
		if (gameState.isTurnActive()) {
			throw new PlayerError('You cannot perform any more actions this turn.')
		}
	}

	return {
		calculateDieScore: (dice: DiePair) => calculateScore(dice),
		getPreviousActions: () => {
			ensureTurnActive()
			return gameState.getPreviousActions().map(action => action.announcedValue)
		},
		getPreviousAction: () => {
			ensureTurnActive()
			return gameState.getPreviousActions()[0]?.announcedValue
		},
		roundUpToValidScore: (score: number) => roundUpToValidScore(score),
		isFirstInRound: () => {
			ensureTurnActive()
			return gameState.isFirstInRound()
		},
		detEllerDerover: () => {
			ensureTurnActive()
			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('Cannot do "det eller derover" before rolling the dice.')
			}

			if (gameState.isFirstInRound()) {
				throw new PlayerError('Cannot do "det eller derover" as the first action in a round.')
			}

			// TODO: Dont add the roll to the actions immediatly. Only add action when turn is ended. Currently, calling roll and then getLatestAction will return the roll action, not the previous player's action.
			gameState.removePreviousAction()

			const dice = rollDice()
			const score = calculateScore(dice)
			const previousAnnouncedValue = gameState.getPreviousActions()[0]?.announcedValue || 0

			gameState.addAction({
				type: 'detEllerDerover',
				value: score,
				playerIndex,
				announcedValue: previousAnnouncedValue
			})
			gameState.endTurn()
		},
		reveal: () => {
			ensureTurnActive()
			if (gameState.hasPlayerRolled()) {
				throw new PlayerError('Cannot reveal after rolling the dice.')
			}

			const prevPlayerIndex = gameState.getPrevPlayerIndex()
			const prevAction = gameState.getPreviousActions()[0]

			if (!prevAction) {
				throw new PlayerError('No previous action to reveal.')
			}

			const prevPlayerLied = prevAction.value !== prevAction.announcedValue // Doing 'det eller derover' while not scoring that or higher is considered lying
			const prevAnnouncedValueIsMeyer = prevAction.announcedValue === 1000
			const prevValueIsMeyer = prevAction.value === 1000

			if (prevPlayerLied) {
				if (prevAnnouncedValueIsMeyer) {
					gameState.doublePenalizePlayer(prevPlayerIndex)
				} else {
					gameState.penalizePlayer(prevPlayerIndex)
				}
			} else {
				if (prevValueIsMeyer) {
					gameState.doublePenalizePlayer(playerIndex)
				} else {
					gameState.penalizePlayer(playerIndex)
				}
			}

			gameState.endRound()
		},
		roll: () => {
			ensureTurnActive()
			if (gameState.hasPlayerRolled()) {
				throw new PlayerError('You have already rolled the dice this turn.')
			}
			const dice = rollDice()
			const score = calculateScore(dice)
			gameState.addAction({
				type: 'roll',
				value: score,
				playerIndex,
				announcedValue: score
			})
			gameState.setHasRolled(true)
			return score
		},
		lie: (score: number) => {
			ensureTurnActive()

			if (!gameState.hasPlayerRolled()) {
				throw new PlayerError('You must roll before you can lie.')
			}

			const lieValue = score
			const prevValue = gameState.getPreviousActions()[1]?.announcedValue || 0
			const realValue = gameState.getPreviousActions()[0].value

			if (!isValidScore(lieValue)) {
				throw new PlayerError('Invalid lie value.')
			}

			if (lieValue <= prevValue) {
				throw new PlayerError('You must announce a higher value than the previous player.')
			}

			gameState.addAction({
				type: 'lie',
				value: realValue,
				playerIndex,
				announcedValue: lieValue
			})
			gameState.endTurn()
		}
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
`, 'utils.ts': `
export function rollDice(): [number, number] {
	const randomDie = () => Math.floor(Math.random() * 6) + 1
	return [randomDie(), randomDie()]
}

export function calculateScore(dice: [number, number]): number {
	const [die1, die2] = dice.sort((a, b) => b - a)
	if ((die1 === 2 && die2 === 1)) return 1000 // Meyer
	if ((die1 === 3 && die2 === 1)) return 999  // Lille-meyer
	if (die1 === die2) return die1 * 100        // Pairs
	return die1 * 10 + die2                     // Regular scores
}

const validScores = new Set<number>([
	// Special scores
	1000, 999,
	// Pairs
	600, 500, 400, 300, 200, 100,
	// Regular scores
	65, 64, 63, 62, 61,
	54, 53, 52, 51,
	43, 42, 41,
	32,
])

export function isValidScore(score: number): boolean {
	return validScores.has(score)
}

export function roundUpToValidScore(score: number): number {
	const validScoresAscending = [...validScores].sort((a, b) => a - b)
	for (const validScore of validScoresAscending) { 
		if (score <= validScore) return validScore
	}
	return 0
}

export class Scoring {
	private scores: Map<string, number>
	private submissionIds: string[]

	constructor(submissionIds: string[]) {
		this.submissionIds = submissionIds
		this.scores = new Map(submissionIds.map(id => [id, 6]))
	}

	penalize(playerIndex: number, subAmount: number) {
		// Convert player indices to submission IDs
		const id = this.submissionIds[playerIndex]
		const currentScore = this.scores.get(id) || 6
		this.scores.set(id, currentScore - subAmount)
	}

	getScores(): Map<string, number> {
		return this.scores
	}
}`
}

export default files