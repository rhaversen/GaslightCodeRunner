// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

import { runEvaluation, ErrorCategory, runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	slowStrategyFiles,
	slowLoadingStrategyFiles,
	dumbStrategyFiles,
	nonHaltingLoadingStrategyFiles,
	nonHaltingStrategyFiles
} from '../../../utils/sourceFiles.js'

// Setup test environment
import '../../envSetup.js'

const twoMinuteTimeout = 1200000

describe('CodeRunnerService Timeouts', { timeout: twoMinuteTimeout }, () => {
	describe('Evaluation Timeouts - Candidate takes too long', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, slowStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', () => {
			assert.ok(result.error?.includes(ErrorCategory.SCRIPT_TIMEOUT))
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should not disqualify any players', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Timeouts - Candidate never halts', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, nonHaltingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', () => {
			assert.ok(result.error?.includes(ErrorCategory.SCRIPT_TIMEOUT))
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should return null strategy timings', () => {
			assert.equal(result.strategyExecutionTimings, null)
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Timeouts - Candidate takes too long to load', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, slowLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should not return an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results!.candidate, 'number')
			assert.equal(typeof result.results!.average, 'number')
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should not disqualify any players', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Tournament Timeouts - Candidate takes too long to load', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [slowLoadingStrategyFiles, dumbStrategyFiles], 10)
		})

		it('should not return an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results![dumbStrategyFiles.submissionId], 'number')
			assert.equal(typeof result.results![slowLoadingStrategyFiles.submissionId], 'number')
		})

		it('should not disqualify any players', () => {
			assert.deepEqual(result.disqualified, {})
		})

		it('should return strategy timings', () => {
			assert.equal(typeof result.strategyExecutionTimings, 'object')
			assert.ok(Array.isArray(result.strategyExecutionTimings![dumbStrategyFiles.submissionId]))
			assert.ok(Array.isArray(result.strategyExecutionTimings![slowLoadingStrategyFiles.submissionId]))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.equal(typeof result.strategyLoadingTimings![dumbStrategyFiles.submissionId], 'number')
			assert.equal(typeof result.strategyLoadingTimings![slowLoadingStrategyFiles.submissionId], 'number')
		})
	})

	describe('Evaluation Timeouts - Candidate never halts during loading', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, nonHaltingLoadingStrategyFiles, [dumbStrategyFiles], 10)
		})

		it('should return an error', () => {
			assert.ok(result.error?.includes(ErrorCategory.SCRIPT_TIMEOUT))
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should return null strategy timings', () => {
			assert.equal(result.strategyExecutionTimings, null)
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return null strategy loading timings', () => {
			assert.equal(result.strategyLoadingTimings, null)
		})
	})
})
