/* eslint-disable local/enforce-comment-order */

export interface CodeRunnerCallbacks {
    disqualifySubmission(submissionId: string, message: string): void;
}

export interface GameRunnerResult {
    results?: Map<string, number>
    error?: string;
}
