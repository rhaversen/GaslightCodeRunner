/* eslint-disable local/enforce-comment-order */

import { MeyerStrategyAPI } from '../meyer/types.ts'

// We'll use probability statistics of possible dice outcomes to influence our decisions.
export default (api: MeyerStrategyAPI) => {
	// Compute score distribution once
	const allOutcomes: [number, number][] = []
	for (let d1 = 1; d1 <= 6; d1++) {
		for (let d2 = 1; d2 <= 6; d2++) {
			allOutcomes.push([d1, d2])
		}
	}

	const scores = allOutcomes.map(o => api.calculateDieScore(o))
	const total = scores.length
	// Count occurrences of each score
	const frequency: Record<number, number> = {}
	for (const s of scores) {
		frequency[s] = (frequency[s] ?? 0) + 1
	}
	// Sort scores ascending
	const uniqueScores = Object.keys(frequency).map(Number).sort((a,b) => a-b)

	// Probability of >= score: for each score, count outcomes >= that score
	// We'll create a helper function that given a score returns probability of rolling >= that score
	const probabilityAtLeast = (x: number) => {
		const validX = api.roundUpToValidScore(x)
		let count = 0
		for (const s of uniqueScores) {
			if (s >= validX) count += frequency[s]
		}
		return count / total
	}

	if (api.isFirstInRound()) {
		// Just roll if first
		api.roll()
		return
	}

	const lastScore = api.getPreviousAction()
	const currentScore = api.roll()

	// If we have no lastScore or we match/exceed it, just end turn
	if (lastScore === null || currentScore >= lastScore) return

	// Check how likely lastScore is
	const lastScoreProb = probabilityAtLeast(lastScore)

	// If lastScore is very unlikely (e.g. < 5%), suspect a bluff and reveal
	if (lastScoreProb < 0.05) {
		api.reveal()
		return
	}

	// We need to beat lastScore. Try to find a suitable lie:
	// Strategy:
	// 1. If gap small (<50), lying exactly at lastScore might be safe.
	// 2. Otherwise, try to find a score slightly higher than lastScore with decent probability.
	// 3. If no good plausible lie, fallback to detEllerDerover.

	const gap = lastScore - currentScore
	if (gap <= 50) {
		api.lie(lastScore)
		return
	}

	// Try to find a score just above lastScore that isn't too improbable.
	// We'll scan up to a certain range above lastScore.
	let bestLie: number | null = null
	let bestLieProb = 0

	for (const s of uniqueScores) {
		if (s >= lastScore && s < lastScore + 300) {
			const p = probabilityAtLeast(s)
			// We want a decent probability (e.g. >10%), pick the best among them
			if (p > 0.1 && p > bestLieProb) {
				bestLie = s
				bestLieProb = p
			}
		}
	}

	// If we found a decent plausible lie, use it
	if (bestLie !== null) {
		api.lie(bestLie)
		return
	}

	// Otherwise, safer to go "det eller derover"
	api.detEllerDerover()
}
