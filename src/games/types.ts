/* eslint-disable local/enforce-comment-order */

export interface Game {
	init(players: Player[]): void;
	executePlayerTurn(): void;
	getResults(): GameResult;
}

export type Strategy<T = any> = (api: T) => void

export type GameResult = Map<string, number>;

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
