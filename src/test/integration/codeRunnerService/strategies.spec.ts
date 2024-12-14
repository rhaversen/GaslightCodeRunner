// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runGame } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	honestStrategyFiles,
	revealingStrategyFiles,
	detEllerDeroverStrategyFiles,
	chatGptStrategyFiles
} from '../../../app/utils/sourceFiles.js'
import { EvaluationResults, TournamentResults } from '../../../../sourceFiles/gameRunners/types.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('Running games with different strategies', function () {
	it('should run a game with 10 dumb strategies', async function () {
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runGame(gameFiles, strategies, 'Evaluation', 10) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		expect(result.results).to.have.property('candidate')
		expect(result.results).to.have.property('average')
	})

	it('should run a game with 1000 dumb strategies', async function () {
		const strategies = Array(1000).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runGame(gameFiles, strategies, 'Evaluation', 10) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		expect(result.results).to.have.property('candidate')
		expect(result.results).to.have.property('average')
	})

	it('should run a tournament with 10 dumb strategies', async function () {
		this.timeout(twoMinuteTimeout)
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runGame(gameFiles, strategies, 'Tournament', 10) as TournamentResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(Object.keys(result.results!)).to.have.lengthOf(10)
	})

	it('should run a tournament with 1000 dumb strategies', async function () {
		this.timeout(twoMinuteTimeout)
		const strategies = Array(1000).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runGame(gameFiles, strategies, 'Tournament', 10) as TournamentResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(result.results).to.not.be.undefined
		expect(Object.keys(result.results!)).to.have.lengthOf(1000)
	})

	it('should have a similar candidate score and average score for 10 dumb strategies during evaluation', async function () {
		this.timeout(twoMinuteTimeout)
		let otherScores = 0
		let candidateScore = 0
		const iterations = 10
		for (let i = 0; i < iterations; i++) {
			const strategies = Array(10).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runGame(gameFiles, strategies, 'Evaluation', 10) as EvaluationResults
			// Add the scores to the array
			otherScores += result.results!.average
			candidateScore += result.results!.candidate
		}
		expect(candidateScore / iterations).to.be.closeTo(otherScores / iterations, 0.001)
	})

	it('should have a similar score for each dumb strategy during tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const iterations = 10
		const allScores: { [submissionId: string]: number[] } = {}

		for (let i = 0; i < iterations; i++) {
			const strategies = Array(10).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runGame(gameFiles, strategies, 'Tournament', 10) as TournamentResults

			// Store the scores for each submission
			for (const [submissionId, score] of Object.entries(result.results!)) {
				if (!allScores[submissionId]) {
					allScores[submissionId] = []
				}
				allScores[submissionId].push(score)
			}
		}

		// Check if scores are close to their own score in other iterations
		for (const scores of Object.values(allScores)) {
			for (let j = 0; j < scores.length; j++) {
				for (let k = j + 1; k < scores.length; k++) {
					expect(scores[j]).to.be.closeTo(scores[k], 0.002)
				}
			}
		}
	})

	it('should run a tournament with 1 chatGpt strategy and 10 dumb strategies', async function () {
		this.timeout(twoMinuteTimeout)
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const chatGptStrategy = {
			files: { ...chatGptStrategyFiles.files },
			submissionId: 'chatGptStrategy'
		}

		const result = await runGame(gameFiles, [...strategies, chatGptStrategy], 'Tournament', 10) as TournamentResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(Object.keys(result.results!)).to.have.lengthOf(11)
	})

	it('should have a low difference between the highest and lowest score for 10 dumb strategies during tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runGame(gameFiles, strategies, 'Tournament', 10) as TournamentResults

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

		const result = await runGame(gameFiles, [chatGptStrategy, ...strategies], 'Evaluation', 10) as EvaluationResults

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

		const result = await runGame(gameFiles, [chatGptStrategy, ...strategies], 'Tournament', 10) as TournamentResults

		const chatGptScore = result.results!.chatGptStrategy
		const otherScores = Object.values(result.results!)
			.filter((score) => score !== chatGptScore)
			.reduce((acc, score) => acc + score, 0)

		// Higher score is better
		expect(chatGptScore).to.be.greaterThan(otherScores / 10)
	})

	it('should run a tournament with all strategies', async function () {
		this.timeout(twoMinuteTimeout)
		const result = await runGame(
			gameFiles,
			[dumbStrategyFiles, honestStrategyFiles, revealingStrategyFiles, detEllerDeroverStrategyFiles, chatGptStrategyFiles],
			'Tournament',
			10
		) as TournamentResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(Object.keys(result.results!)).to.have.lengthOf(5)
		// It should have a result for each strategy
		expect(result.results).to.not.be.undefined
		expect(Object.keys(result.results!)).to.have.lengthOf(5)
		expect(result.results).to.include.all.keys('dumb', 'honest', 'revealing', 'detEllerDerover', 'chatGpt')
		// The scores should be unique
		const scores = Object.values(result.results!)
		expect(scores).to.have.lengthOf(new Set(scores).size)
	})

	it('should have a similar score for each strategy when using all strategies during tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const iterations = 10
		const allScores: { [submissionId: string]: number[] } = {}

		for (let i = 0; i < iterations; i++) {
			const result = await runGame(
				gameFiles,
				[
					dumbStrategyFiles,
					honestStrategyFiles,
					revealingStrategyFiles,
					detEllerDeroverStrategyFiles,
					chatGptStrategyFiles
				],
				'Tournament',
				10
			) as TournamentResults

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
