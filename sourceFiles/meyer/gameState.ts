/* eslint-disable local/enforce-comment-order */

import type { GameResult } from '../commonTypes.d.ts'
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

	isRoundActive(): boolean {
		return this.roundActive
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
