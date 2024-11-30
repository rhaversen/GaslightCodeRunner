/* eslint-disable local/enforce-comment-order */

export interface Game {
	init(players: Player[]): void;
	executePlayerTurn(): void;
	getResults(): GameResult;
}

export type Statistic = {
	submissionId: string;
	turns: number;
	timeouts: number;
	correct: number;
	incorrect: number;
}

export type Strategy<T = any> = (api: T) => void

export interface GameResult {
	results?: Record<string, { score: number; statistic?: Statistic }>;
	history?: unknown[]
	error?: string;
}

export interface GameCallbacks {
	disqualifyPlayer(playerIndex: number): void;
}

export interface Player {
	strategy: Strategy
	submissionId: string
}

export class PlayerError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'PlayerError'
	}
}
