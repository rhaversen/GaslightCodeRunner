/* eslint-disable local/enforce-comment-order */

// From the VM
export interface VMResults {
	error?: string // Game error
	results?: Record<string, number> // Results
	disqualified?: Record<string, string> // SubmissionId -> error
}
