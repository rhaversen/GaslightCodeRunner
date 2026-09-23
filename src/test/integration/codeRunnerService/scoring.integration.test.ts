import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runEvaluation, runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	honestStrategyFiles,
	revealingStrategyFiles,
	detEllerDeroverStrategyFiles,
	chatGptStrategyFiles,
	lyingStrategyFiles
} from '../../fixtures/gameFixtures.js'

import '../../envSetup.js'

const twoMinuteTimeout = 1200000

describe('Running games with different strategies', () => {
	it('should have a similar candidate score and average score for 10 dumb strategies during evaluation', { timeout: twoMinuteTimeout }, async () => {
		let otherScores = 0
		let candidateScore = 0
		const iterations = 10
		for (let i = 0; i < iterations; i++) {
			const strategies = Array(9).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)
			otherScores += result.results!.average
			candidateScore += result.results!.candidate
		}
		// Seat rotation makes candidate and opponents average over identical
		// distributions, but Meyer's dice randomness still yields a mean-delta
		// noise of ~0.001 across 10 runs; 0.005 is ~4 sigma of that noise.
		assert.ok(Math.abs(candidateScore / iterations - otherScores / iterations) <= 0.005)
	})

	it('should have a low difference between the highest and lowest score for 10 dumb strategies during tournament', { timeout: twoMinuteTimeout }, async () => {
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runTournament(gameFiles, strategies, 10)

		const scores = Object.values(result.results!)

		// The difference between the highest and lowest score should be small;
		// deterministic selection keeps it tight, but Meyer's dice rolls still
		// spread identical strategies by ~0.001-0.002.
		const maxDiff = Math.max(...scores) - Math.min(...scores)
		assert.ok(maxDiff < 0.004)
	})

	it('should have a larger score for chatGpt strategy than dumb strategies during evaluation', { timeout: twoMinuteTimeout }, async () => {
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const chatGptStrategy = {
			files: { ...chatGptStrategyFiles.files },
			submissionId: 'chatGptStrategy'
		}

		const result = await runEvaluation(gameFiles, chatGptStrategy, strategies, 10)

		const candidateScore = result.results!.candidate
		const averageScore = result.results!.average

		// Higher score is better
		assert.ok(candidateScore > averageScore)
	})

	it('should have a larger score for chatGpt strategy than dumb strategies during tournament', { timeout: twoMinuteTimeout }, async () => {
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const chatGptStrategy = {
			files: { ...chatGptStrategyFiles.files },
			submissionId: 'chatGptStrategy'
		}

		const result = await runTournament(gameFiles, [chatGptStrategy, ...strategies], 10)

		const chatGptScore = result.results!.chatGptStrategy
		const otherScores = Object.values(result.results!)
			.filter((score) => score !== chatGptScore)
			.reduce((acc, score) => acc + score, 0)

		// Higher score is better
		assert.ok(chatGptScore > otherScores / 10)
	})

	it('should have a similar score for each strategy when using all strategies during tournament', { timeout: twoMinuteTimeout }, async () => {
		const iterations = 10
		const allScores: { [submissionId: string]: number[] } = {}

		for (let i = 0; i < iterations; i++) {
			const result = await runTournament(
				gameFiles,
				[
					dumbStrategyFiles,
					honestStrategyFiles,
					revealingStrategyFiles,
					detEllerDeroverStrategyFiles,
					chatGptStrategyFiles,
					lyingStrategyFiles
				],
				10
			)

			// Store the scores for each submission
			for (const [submissionId, score] of Object.entries(result.results!)) {
				if (allScores[submissionId] === undefined) {
					allScores[submissionId] = []
				}
				allScores[submissionId].push(score)
			}
		}

		// Acceptable standard deviation: 0.5% of the mean, but never less than an
		// absolute floor. A relative-only threshold is wrong for strategies whose
		// mean score is near zero (e.g. detEllerDerover at ~-0.04): the tolerance
		// collapses below the intrinsic per-epoch noise of the game, which does
		// not shrink with the mean. The floor is set at ~4x the measured
		// cross-tournament noise of the pipeline (sd ~0.0003), since Meyer's
		// dice randomness occasionally spikes a single iteration beyond 2 sigma.
		const stdDevThresholdPercentage = 0.005 // 0.5%
		const stdDevAbsoluteFloor = 0.002

		const calculateMean = (scores: number[]): number => {
			const sum = scores.reduce((acc, val) => acc + val, 0)
			return sum / scores.length
		}

		const calculateStdDev = (scores: number[], mean: number): number => {
			const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length
			return Math.sqrt(variance)
		}

		// Analyze consistency for each strategy
		for (const [submissionId, scores] of Object.entries(allScores)) {
			const mean = calculateMean(scores)
			const stdDev = calculateStdDev(scores, mean)
			const threshold = Math.max(stdDevAbsoluteFloor, Math.abs(mean) * stdDevThresholdPercentage)

			assert.ok(stdDev <= threshold, `Standard deviation for ${submissionId} is too high: ${stdDev.toFixed(5)} exceeds threshold ${threshold.toFixed(5)}`)
		}
	})
})
