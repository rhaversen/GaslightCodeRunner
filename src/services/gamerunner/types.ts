/* eslint-disable local/enforce-comment-order */

import { Game, Player } from '../../games/types'

export interface GameRunner {
    (game: Game, players: Player[], callbacks: CodeRunnerCallbacks): GameRunnerResult
}

export interface CodeRunnerCallbacks {
    disqualifySubmission(submissionId: string, message: string): void;
}

interface GameRunnerResult {
    results?: Map<string, number>
    error?: string;
}
