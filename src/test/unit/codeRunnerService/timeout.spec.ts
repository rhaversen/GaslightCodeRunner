// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runEvaluation, ErrorCategory } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	slowStrategyFiles,
	slowLoadingStrategyFiles,
	dumbStrategyFiles,
	nonHaltingLoadingStrategyFiles,
	nonHaltingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'
import { EvaluationResults } from '../../../../sourceFiles/gameRunners/types.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService Timeouts', function () {
	this.timeout(twoMinuteTimeout)

	describe('Evaluation Timeouts - Candidate takes too long', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, slowStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result.error).to.include(ErrorCategory.STRATEGY_EXECUTION_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return strategy timings', function () {
			expect(result.strategyTimings).to.not.be.undefined
			expect(result.strategyTimings).to.have.lengthOf(1)
		})

		it('should add the strategy to timedOutPlayers', function () {
			expect(result.timedOutPlayers).to.deep.equal([slowStrategyFiles.submissionId])
		})

		it('should not disqualify any players', function () {
			expect(result.disqualified).to.be.empty
		})
	})

	describe('Evaluation Timeouts - Candidate never halts', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, nonHaltingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result.error).to.include(ErrorCategory.SCRIPT_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return empty strategy timings', function () {
			expect(result.strategyTimings).to.be.an('array').that.is.empty
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.empty
		})

		it('should add the strategy to timedOutPlayers', function () {
			expect(result.timedOutPlayers).to.deep.equal([nonHaltingStrategyFiles.submissionId])
		})
	})

	describe('Evaluation Timeouts - Candidate takes too long to load', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, slowLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result.error).to.include(ErrorCategory.STRATEGY_LOADING_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return empty strategy timings', function () {
			expect(result.strategyTimings).to.be.an('array').that.is.empty
		})

		it('should add the strategy to timedOutPlayers', function () {
			expect(result.timedOutPlayers).to.deep.equal([slowLoadingStrategyFiles.submissionId])
		})

		it('should not disqualify any players', function () {
			expect(result.disqualified).to.be.empty
		})
	})

	describe('Evaluation Timeouts - Candidate never halts during loading', function () {
		let result: EvaluationResults

		before(async function () {
			result = await runEvaluation(gameFiles, nonHaltingLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', function () {
			expect(result.error).to.include(ErrorCategory.SCRIPT_TIMEOUT)
		})

		it('should not return results', function () {
			expect(result.results).to.be.undefined
		})

		it('should return empty strategy timings', function () {
			expect(result.strategyTimings).to.be.an('array').that.is.empty
		})

		it('should not disqualify the candidate', function () {
			expect(result.disqualified).to.be.empty
		})

		it('should add the strategy to timedOutPlayers', function () {
			expect(result.timedOutPlayers).to.deep.equal([nonHaltingLoadingStrategyFiles.submissionId])
		})
	})
})
