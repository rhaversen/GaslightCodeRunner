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
	cheatingStrategyFiles,
	dumbStrategyFiles,
	errorThrowingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'
import { EvaluationResults, TournamentResults } from '../../../../sourceFiles/gameRunners/types.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService Errors', function () {
	this.timeout(twoMinuteTimeout)

	describe('Evaluation Errors - Strategy throws an error', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, cheatingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.equal(cheatingStrategyFiles.submissionId)
		})

		it('should include the error message', function () {
			expect(result.error).to.be.a('string')
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})
	})

	describe('Evaluation Errors - Strategy throws an error', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, errorThrowingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.equal(errorThrowingStrategyFiles.submissionId)
		})

		it('should include the error message', function () {
			expect(result.error).to.be.a('string')
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})
	})

	describe('Evaluation Errors - Other strategies disqualified', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [errorThrowingStrategyFiles], 10)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should return results', function () {
			expect(result.results).to.not.be.undefined
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.empty
		})
	})

	describe('Evaluation Errors - Other strategies cheat', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [cheatingStrategyFiles], 10)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should return results', function () {
			expect(result.results).to.not.be.undefined
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.empty
		})
	})

	describe('Tournament Errors - No strategies', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [], 10)
		})

		it('should have an error', function () {
			expect(result.error).to.be.a('string')
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should not disqualify any strategies', function () {
			expect(result.disqualified).to.be.empty
		})
	})

	describe('Tournament Errors - Strategy throws an error', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [cheatingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.include(cheatingStrategyFiles.submissionId)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should not disqualify other strategies', function () {
			expect(result.disqualified).to.not.include(dumbStrategyFiles.submissionId)
		})
	})

	describe('Tournament Errors - Multiple strategies cheat', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
			], 10)
		})

		it('should disqualify all cheating strategies', function () {
			expect(result.disqualified).to.include.members(['cheating1', 'cheating2'])
		})

		it('should not disqualify other strategies', function () {
			expect(result.disqualified).to.not.include('dumb')
		})
	})

	describe('Tournament Errors - Strategy throws an error', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [errorThrowingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.include(errorThrowingStrategyFiles.submissionId)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})
	})

	describe('Tournament Errors - Multiple strategies throw errors', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
			], 10)
		})

		it('should disqualify all error-throwing strategies', function () {
			expect(result.disqualified).to.include.members(['errorThrowing1', 'errorThrowing2'])
		})

		it('should not disqualify other strategies', function () {
			expect(result.disqualified).to.not.include('dumb')
		})
	})
})
