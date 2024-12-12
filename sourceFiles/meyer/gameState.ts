/* eslint-disable local/enforce-comment-order */

import { Action } from './types.ts'

class GameState {
	private static instance: GameState
	private previousActions: Action[] = []
	private firstInRound = true
	private currentPlayerIndex = 0
	private amountOfPlayers = 0
	private hasRolled = false
	private scoring: Map<string, number> = new Map()
	private turnActive = true
	private roundActive = true
	private playerIds: string[] = []

	static getInstance(): GameState {
		if (!GameState.instance) {
			console.log('GameState instance created')
			GameState.instance = new GameState()
		}
		console.log('GameState instance returned')
		return GameState.instance
	}

	init(ids: string[]) {
		this.amountOfPlayers = ids.length
		this.playerIds = [...ids]
		this.scoring = new Map(ids.map(id => [id, 0]))
	}

	addAction(action: Action): void {
		this.previousActions.unshift(action)
	}

	penalizePlayer(playerIndex: number): void {
		const playerId = this.playerIds[playerIndex]
		const currentScore = this.scoring.get(playerId)!
		this.scoring.set(playerId, currentScore - 1)
	}

	doublePenalizePlayer(playerIndex: number): void {
		const playerId = this.playerIds[playerIndex]
		const currentScore = this.scoring.get(playerId)!
		this.scoring.set(playerId, currentScore - 2)
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

	isRoundActive(): boolean {
		return this.roundActive
	}

	prepareNextTurn(): void {
		if (this.roundActive) {
			// If the round is still active, we only need to prepare the next player
			this.firstInRound = false
		} else {
			// If the round is over, we need to reset the round and prepare the next player
			this.firstInRound = true
			this.previousActions = []
			this.roundActive = true
		}
		// Reset turn-specific variables
		this.hasRolled = false
		this.turnActive = true
		// Increment the current player index
		this.incrementCurrentPlayerIndex()
	}

	getResults() {
		return this.scoring
	}
}

export const gameState = GameState.getInstance()
