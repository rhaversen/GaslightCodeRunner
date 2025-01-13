// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it, before } from 'mocha'

// Own modules
import { ErrorCategory, runEvaluation, runTournament } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	cheatingStrategyFiles,
	dumbStrategyFiles,
	errorThrowingStrategyFiles
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

	describe('Evaluation Errors - Strategy cheats', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, cheatingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.be.a('string')
		})

		it('should not have an error message', function () {
			expect(result.error).to.be.undefined
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.a('number')
		})
	})

	describe('Evaluation Errors - Strategy throws an error', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, errorThrowingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.be.a('string')
		})

		it('should not have a error message', function () {
			expect(result.error).to.be.undefined
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.a('number')
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
			expect(result.results?.candidate).to.not.be.undefined
			expect(result.results?.average).to.not.be.undefined
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.null
		})

		it('should return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.a('number')
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
			expect(result.results?.candidate).to.not.be.undefined
			expect(result.results?.average).to.not.be.undefined
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.null
		})

		it('should return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.a('number')
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

		it('should not return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.be.empty
		})

		it('should not return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.deep.equal({})
		})
	})

	describe('Tournament Errors - Strategy cheats', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [cheatingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.have.property(cheatingStrategyFiles.submissionId)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should not disqualify other strategies', function () {
			expect(result.disqualified).to.not.have.property(dumbStrategyFiles.submissionId)
		})

		it('should return strategy timings of non-cheating strategy', function () {
			expect(result.strategyExecutionTimings[dumbStrategyFiles.submissionId]).to.be.an('array')
		})

		it('should return results of non-cheating strategy', function () {
			expect(result.results).to.not.be.empty
			expect(result.results).to.have.property(dumbStrategyFiles.submissionId)
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property(dumbStrategyFiles.submissionId)
			expect(result.strategyLoadingTimings).to.have.property(cheatingStrategyFiles.submissionId)
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
			expect(Object.keys(result.disqualified)).to.include.members(['cheating1', 'cheating2'])
		})

		it('should not disqualify other strategies', function () {
			expect(result.disqualified).to.not.have.property('dumb')
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should return strategy timings of non-cheating strategy', function () {
			expect(result.strategyExecutionTimings['dumb']).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property('dumb')
			expect(result.strategyLoadingTimings).to.have.property('cheating1')
			expect(result.strategyLoadingTimings).to.have.property('cheating2')
		})
	})

	describe('Tournament Errors - Strategy throws an error', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [errorThrowingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should disqualify the strategy', function () {
			expect(result.disqualified).to.have.property(errorThrowingStrategyFiles.submissionId)
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should return results', function () {
			expect(result.results).to.not.be.empty
			expect(result.results).to.have.property(dumbStrategyFiles.submissionId)
		})

		it('should return strategy timings of non-error-throwing strategy', function () {
			expect(result.strategyExecutionTimings[dumbStrategyFiles.submissionId]).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property(dumbStrategyFiles.submissionId)
			expect(result.strategyLoadingTimings).to.have.property(errorThrowingStrategyFiles.submissionId)
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
			expect(result.disqualified).to.have.property('errorThrowing1')
			expect(result.disqualified).to.have.property('errorThrowing2')
		})

		it('should not have an error', function () {
			expect(result.error).to.be.undefined
		})

		it('should return results of non-error-throwing strategy', function () {
			expect(result.results).to.not.be.empty
			expect(result.results).to.have.property('dumb')
		})

		it('should return strategy timings of non-error-throwing strategy', function () {
			expect(result.strategyExecutionTimings['dumb']).to.be.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property('dumb')
			expect(result.strategyLoadingTimings).to.have.property('errorThrowing1')
			expect(result.strategyLoadingTimings).to.have.property('errorThrowing2')
		})
	})

	describe('Tournament Errors - All strategies cheating', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating2' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating3' }
			], 10)
		})

		it('should disqualify all cheating strategies', function () {
			expect(result.disqualified).to.have.keys(['cheating1', 'cheating2', 'cheating3'])
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should have an error', function () {
			expect(result.error).to.equal(ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should not return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.deep.equal({})
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property('cheating1')
			expect(result.strategyLoadingTimings).to.have.property('cheating2')
			expect(result.strategyLoadingTimings).to.have.property('cheating3')
		})
	})

	describe('Tournament Errors - All strategies throw errors', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error2' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error3' }
			], 10)
		})

		it('should disqualify all strategies', function () {
			expect(Object.keys(result.disqualified)).to.include.members(['error1', 'error2', 'error3'])
		})

		it('should have an error', function () {
			expect(result.error).to.equal(ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should not return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.deep.equal({})
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property('error1')
			expect(result.strategyLoadingTimings).to.have.property('error2')
			expect(result.strategyLoadingTimings).to.have.property('error3')
		})
	})

	describe('Tournament Errors - All strategies problematic', function () {
		let result: TournamentResults

		before(async function () {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error2' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' }
			], 10)
		})

		it('should return an error', function () {
			expect(result.error).to.equal(ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should disqualify all strategies', function () {
			expect(result.disqualified).to.have.keys(['error1', 'error2', 'cheating1'])
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should not return strategy timings', function () {
			expect(result.strategyExecutionTimings).to.deep.equal({})
		})

		it('should return strategy loading timings', function () {
			expect(result.strategyLoadingTimings).to.be.an('object')
			expect(result.strategyLoadingTimings).to.have.property('error1')
			expect(result.strategyLoadingTimings).to.have.property('error2')
			expect(result.strategyLoadingTimings).to.have.property('cheating1')
		})
	})
})
