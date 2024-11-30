/* eslint-disable local/enforce-comment-order */

export type Statistic = {
	submissionId: string;
	turns: number;
	timeouts: number;
	correct: number;
	incorrect: number;
}

export interface GameResult {
	results?: Record<string, { score: number; statistic?: Statistic }>;
	history?: unknown[]
	error?: string;
}

export interface GameCallbacks {
	disqualifyPlayer(playerIndex: number): void;
}
