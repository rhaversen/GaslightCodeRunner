// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runEvaluation, ErrorCategory, runTournament } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	slowStrategyFiles,
	slowLoadingStrategyFiles,
	dumbStrategyFiles,
	nonHaltingLoadingStrategyFiles,
	nonHaltingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService Timeouts', function () {
	this.timeout(twoMinuteTimeout)

	describe('Evaluation Timeouts - Candidate takes too long', function () {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async function () {
			result = await runEvaluation(gameFiles, slowStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result).to.have.property('error').that.includes(ErrorCategory.SCRIPT_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result).to.have.property('results').that.is.undefined
		})

		it('should return strategy timings', function () {
			expect(result).to.have.property('strategyExecutionTimings').that.is.an('array')
		})

		it('should not disqualify any players', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should return strategy loading timings', function () {
			expect(result).to.have.property('strategyLoadingTimings').that.is.a('number')
		})
	})

	describe('Evaluation Timeouts - Candidate never halts', function () {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async function () {
			result = await runEvaluation(gameFiles, nonHaltingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result).to.have.property('error').that.includes(ErrorCategory.SCRIPT_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result).to.have.property('results').that.is.undefined
		})

		it('should return empty strategy timings', function () {
			expect(result).to.have.property('strategyExecutionTimings').that.is.an('array').that.is.empty
		})

		it('should not disqualify the candidate', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should return strategy loading timings', function () {
			expect(result).to.have.property('strategyLoadingTimings').that.is.a('number')
		})
	})

	describe('Evaluation Timeouts - Candidate takes too long to load', function () {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async function () {
			result = await runEvaluation(gameFiles, slowLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should not return an error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should return results', function () {
			expect(result).to.have.property('results').that.is.an('object')
			expect(result.results).to.have.property('candidate').that.is.a('number')
			expect(result.results).to.have.property('average').that.is.a('number')
		})

		it('should return strategy timings', function () {
			expect(result).to.have.property('strategyExecutionTimings').that.is.an('array')
		})

		it('should not disqualify any players', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should return strategy loading timings', function () {
			expect(result).to.have.property('strategyLoadingTimings').that.is.a('number')
		})
	})

	describe('Tournament Timeouts - Candidate takes too long to load', function () {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async function () {
			result = await runTournament(gameFiles, [slowLoadingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should not return an error', function () {
			expect(result).to.have.property('error').that.is.undefined
		})

		it('should return results', function () {
			expect(result).to.have.property('results').that.is.an('object')
			expect(result.results).to.have.property(dumbStrategyFiles.submissionId).that.is.a('number')
			expect(result.results).to.have.property(slowLoadingStrategyFiles.submissionId).that.is.a('number')
		})

		it('should not disqualify any players', function () {
			expect(result).to.have.property('disqualified').that.is.an('object').that.is.empty
		})

		it('should return strategy timings', function () {
			expect(result).to.have.property('strategyExecutionTimings').that.is.an('object')
			expect(result.strategyExecutionTimings).to.have.property(dumbStrategyFiles.submissionId).that.is.an('array')
			expect(result.strategyExecutionTimings).to.have.property(slowLoadingStrategyFiles.submissionId).that.is.an('array')
		})

		it('should return strategy loading timings', function () {
			expect(result).to.have.property('strategyLoadingTimings').that.is.an('object')
			expect(result.strategyLoadingTimings).to.have.property(dumbStrategyFiles.submissionId).that.is.a('number')
			expect(result.strategyLoadingTimings).to.have.property(slowLoadingStrategyFiles.submissionId).that.is.a('number')
		})
	})

	describe('Evaluation Timeouts - Candidate never halts during loading', function () {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async function () {
			result = await runEvaluation(gameFiles, nonHaltingLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result).to.have.property('error').that.includes(ErrorCategory.SCRIPT_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result).to.have.property('results').that.is.undefined
		})

		it('should return empty strategy timings', function () {
			expect(result).to.have.property('strategyExecutionTimings').that.is.an('array').that.is.empty
		})

		it('should not disqualify the candidate', function () {
			expect(result).to.have.property('disqualified').that.is.null
		})

		it('should return strategy loading timings', function () {
			expect(result).to.have.property('strategyLoadingTimings').that.is.a('number')
		})
	})
})
