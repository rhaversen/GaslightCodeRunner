/* eslint-disable local/enforce-comment-order */

import { GameResult } from '../types.js'
import { Action } from './types.js'
import { Scoring } from './utils.js'

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
	private submissionIds: string[] = []
	private statistics: Map<string, Statistic> = new Map()

	static getInstance(): GameState {
		if (!GameState.instance) {
			GameState.instance = new GameState()
		}
		return GameState.instance
	}

	init(ids: string[]) {
		this.amountOfPlayers = ids.length
		this.submissionIds = ids
		this.scoring = new Scoring(ids)
		ids.forEach(id => this.statistics.set(id, {
			submissionId: id,
			turns: 0,
			timeouts: 0,
			correct: 0,
			incorrect: 0
		}))
	}

	addAction(action: Action): void {
		this.previousActions.unshift(action)
	}

	penalizePlayer(playerIndex: number): void {
		this.scoring?.penalize(playerIndex)
		const stats = this.statistics.get(this.submissionIds[playerIndex])
		if (stats) stats.incorrect++
	}

	doublePenalizePlayer(playerIndex: number): void {
		this.penalizePlayer(playerIndex)
		this.penalizePlayer(playerIndex)
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
		const scores = this.scoring?.getScores()
		if (!scores) {
			throw new Error('Scores are not available')
		}
		const results: Record<string, { score: number; statistic?: Statistic }> = {}
		for (let i = 0; i < this.amountOfPlayers; i++) {
			results[this.submissionIds[i]] = {
				score: scores[i],
				statistic: this.statistics.get(this.submissionIds[i])
			}
		}
		return { results }
	}
}

export const gameState = GameState.getInstance()
