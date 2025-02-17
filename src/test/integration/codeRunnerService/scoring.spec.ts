// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runEvaluation, runTournament } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	honestStrategyFiles,
	revealingStrategyFiles,
	detEllerDeroverStrategyFiles,
	chatGptStrategyFiles,
	lyingStrategyFiles
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('Running games with different strategies', function () {
	it('should have a similar candidate score and average score for 10 dumb strategies during evaluation', async function () {
		this.timeout(twoMinuteTimeout)
		let otherScores = 0
		let candidateScore = 0
		const iterations = 10
		for (let i = 0; i < iterations; i++) {
			const strategies = Array(9).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)
			// Add the scores to the array
			otherScores += result.results!.average
			candidateScore += result.results!.candidate
		}
		expect(candidateScore / iterations).to.be.closeTo(otherScores / iterations, 0.001)
	})

	it('should have a low difference between the highest and lowest score for 10 dumb strategies during tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runTournament(gameFiles, strategies, 10)

		const scores = Object.values(result.results!)

		// The difference between the highest and lowest score should be less than 0.05
		const maxDiff = Math.max(...scores) - Math.min(...scores)
		expect(maxDiff).to.be.lessThan(0.002)
	})

	it('should have a larger score for chatGpt strategy than dumb strategies during evaluation', async function () {
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
		expect(candidateScore).to.be.greaterThan(averageScore)
	})

	it('should have a larger score for chatGpt strategy than dumb strategies during tournament', async function () {
		this.timeout(twoMinuteTimeout)
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
		expect(chatGptScore).to.be.greaterThan(otherScores / 10)
	})

	it('should have a similar score for each strategy when using all strategies during tournament', async function () {
		this.timeout(twoMinuteTimeout)
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
				if (!allScores[submissionId]) {
					allScores[submissionId] = []
				}
				allScores[submissionId].push(score)
			}
		}

		// Define acceptable standard deviation threshold
		const stdDevThresholdPercentage = 0.005 // 0.5%

		// Function to calculate mean
		const calculateMean = (scores: number[]): number => {
			const sum = scores.reduce((acc, val) => acc + val, 0)
			return sum / scores.length
		}

		// Function to calculate standard deviation
		const calculateStdDev = (scores: number[], mean: number): number => {
			const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length
			return Math.sqrt(variance)
		}

		// Analyze consistency for each strategy
		for (const [submissionId, scores] of Object.entries(allScores)) {
			const mean = calculateMean(scores)
			const stdDev = calculateStdDev(scores, mean)
			const threshold = Math.abs(mean) * stdDevThresholdPercentage

			// Assert that the standard deviation is below the threshold
			expect(stdDev).to.be.below(threshold, `Standard deviation for ${submissionId} is too high: ${stdDev.toFixed(5)} exceeds threshold ${threshold.toFixed(5)}`)
		}
	})
})
