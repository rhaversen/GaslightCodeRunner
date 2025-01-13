// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it, before } from 'mocha'

// Own modules
import { runEvaluation, runTournament } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	chatGptStrategyFiles,
	detEllerDeroverStrategyFiles,
	honestStrategyFiles,
	lyingStrategyFiles,
	revealingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'
import { EvaluationResults, submission, TournamentResults } from '../../../../sourceFiles/gameRunners/types.js'

describe('CodeRunnerService', function () {
	this.timeout(twoMinuteTimeout)

	describe('Evaluation - 1 candidate and 1 other', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})
	})

	describe('Tournament - 1 strategy', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [dumbStrategyFiles], 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})
	})

	describe('Tournament - 2 strategies', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [dumbStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})
	})

	describe('Evaluation - 10 dumb strategies', function () {
		let result: EvaluationResults

		before(async function () {
			const strategies = Array(9).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should have candidate results', function () {
			expect(result.results).to.have.property('candidate').that.is.a('number')
		})

		it('should have average results', function () {
			expect(result.results).to.have.property('average').that.is.a('number')
		})
	})

	describe('Evaluation - 1000 dumb strategies', function () {
		let result: EvaluationResults

		before(async function () {
			const strategies = Array(999).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should have candidate results', function () {
			expect(result.results).to.have.property('candidate').that.is.a('number')
		})

		it('should have average results', function () {
			expect(result.results).to.have.property('average').that.is.a('number')
		})
	})

	describe('Tournament - 10 dumb strategies', function () {
		let result: TournamentResults

		before(async function () {
			const strategies = Array(10).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runTournament(gameFiles, strategies, 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should have a result for each strategy', function () {
			expect(result.results).to.be.an('object').that.has.keys(Array.from({ length: 10 }, (_, i) => `dumbStrategy_${i + 1}`))
		})
	})

	describe('Tournament - 1000 dumb strategies', function () {
		let result: TournamentResults

		before(async function () {
			const strategies = Array(1000).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runTournament(gameFiles, strategies, 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should have a result for each strategy', function () {
			expect(result.results).to.be.an('object').that.has.keys(Array.from({ length: 1000 }, (_, i) => `dumbStrategy_${i + 1}`))
		})
	})

	describe('Tournament - All strategies', function () {
		let result: TournamentResults
		let strategies: submission[]

		before(async function () {
			strategies = [
				dumbStrategyFiles,
				honestStrategyFiles,
				revealingStrategyFiles,
				detEllerDeroverStrategyFiles,
				chatGptStrategyFiles,
				lyingStrategyFiles
			]
			result = await runTournament(gameFiles, strategies, 10)
		})

		it('should not be undefined', function () {
			expect(result).to.not.be.undefined
		})

		it('should have results', function () {
			expect(result).to.have.property('results').that.is.an('object')
		})

		it('should have no disqualified players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should have no error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should have a result for each strategy', function () {
			expect(result.results).to.be.an('object').that.has.keys(strategies.map((strategy) => strategy.submissionId))
		})

		it('should include all strategy submission IDs', function () {
			expect(result.results).to.include.all.keys(strategies.map((strategy) => strategy.submissionId))
		})

		it('should have unique scores for each strategy', function () {
			const scores = Object.values(result.results!)
			expect(scores).to.have.lengthOf(new Set(scores).size)
		})
	})
})
