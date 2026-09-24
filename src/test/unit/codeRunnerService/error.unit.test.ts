// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

import { ErrorCategory, runEvaluation, runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	cheatingStrategyFiles,
	dumbStrategyFiles,
	errorThrowingStrategyFiles
} from '../../fixtures/gameFixtures.js'

// Setup test environment
import '../../envSetup.js'

const twoMinuteTimeout = 1200000

describe('CodeRunnerService Errors', { timeout: twoMinuteTimeout }, () => {
	describe('Evaluation Errors - Strategy cheats', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, cheatingStrategyFiles, [dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify the strategy', () => {
			assert.equal(typeof result.disqualified, 'string')
		})

		it('should not have an error message', () => {
			assert.equal(result.error, undefined)
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should return null strategy timings', () => {
			assert.equal(result.strategyExecutionTimings, null)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Errors - Strategy throws an error', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, errorThrowingStrategyFiles, [dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify the strategy', () => {
			assert.equal(typeof result.disqualified, 'string')
		})

		it('should not have an error message', () => {
			assert.equal(result.error, undefined)
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should return null strategy timings', () => {
			assert.equal(result.strategyExecutionTimings, null)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Errors - All other strategies throw errors', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [errorThrowingStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results!.candidate, 'number')
			assert.equal(result.results!.average, 0)
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Errors - All other strategies cheat', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [cheatingStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results!.candidate, 'number')
			assert.equal(result.results!.average, 0)
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Errors - Some other strategies throw errors', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles,
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
				[
					{ files: errorThrowingStrategyFiles.files, submissionId: 'error1' },
					{ files: dumbStrategyFiles.files, submissionId: 'dumb2' },
					{ files: dumbStrategyFiles.files, submissionId: 'dumb3' }
				],
				{ minPlayers: 2, maxPlayers: 10 })
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results!.candidate, 'number')
			assert.equal(typeof result.results!.average, 'number')
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Evaluation Errors - Some other strategies cheat', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles,
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
				[
					{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
					{ files: dumbStrategyFiles.files, submissionId: 'dumb2' },
					{ files: dumbStrategyFiles.files, submissionId: 'dumb3' }
				],
				{ minPlayers: 2, maxPlayers: 10 })
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.equal(typeof result.results, 'object')
			assert.equal(typeof result.results!.candidate, 'number')
			assert.equal(typeof result.results!.average, 'number')
		})

		it('should not disqualify the candidate', () => {
			assert.equal(result.disqualified, null)
		})

		it('should return strategy timings', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'number')
		})
	})

	describe('Tournament Errors - No strategies', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should have an error', () => {
			assert.equal(typeof result.error, 'string')
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should not disqualify any strategies', () => {
			assert.deepEqual(result.disqualified, {})
		})

		it('should not return strategy timings', () => {
			assert.deepEqual(result.strategyExecutionTimings, {})
		})

		it('should return strategy loading timings', () => {
			assert.deepEqual(result.strategyLoadingTimings, {})
		})
	})

	describe('Tournament Errors - Strategy cheats', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [cheatingStrategyFiles, dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify the strategy', () => {
			assert.ok(cheatingStrategyFiles.submissionId in result.disqualified!)
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should not disqualify other strategies', () => {
			assert.ok(!(dumbStrategyFiles.submissionId in result.disqualified!))
		})

		it('should return strategy timings of non-cheating strategy', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings?.[dumbStrategyFiles.submissionId]))
		})

		it('should return results of non-cheating strategy', () => {
			assert.ok(result.results !== undefined && Object.keys(result.results).length > 0)
			assert.ok(dumbStrategyFiles.submissionId in result.results!)
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok(dumbStrategyFiles.submissionId in result.strategyLoadingTimings!)
			assert.ok(cheatingStrategyFiles.submissionId in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - Multiple strategies cheat', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' }
			], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify all cheating strategies', () => {
			for (const id of ['cheating1', 'cheating2']) {
				assert.ok(id in result.disqualified!)
			}
		})

		it('should not disqualify other strategies', () => {
			assert.ok(!('dumb' in result.disqualified!))
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return strategy timings of non-cheating strategy', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings?.['dumb']))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok('dumb' in result.strategyLoadingTimings!)
			assert.ok('cheating1' in result.strategyLoadingTimings!)
			assert.ok('cheating2' in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - Strategy throws an error', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [errorThrowingStrategyFiles, dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify the strategy', () => {
			assert.ok(errorThrowingStrategyFiles.submissionId in result.disqualified!)
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results', () => {
			assert.ok(result.results !== undefined && Object.keys(result.results).length > 0)
			assert.ok(dumbStrategyFiles.submissionId in result.results!)
		})

		it('should return strategy timings of non-error-throwing strategy', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings?.[dumbStrategyFiles.submissionId]))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok(dumbStrategyFiles.submissionId in result.strategyLoadingTimings!)
			assert.ok(errorThrowingStrategyFiles.submissionId in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - Multiple strategies throw errors', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' }
			], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify all error-throwing strategies', () => {
			for (const id of ['errorThrowing1', 'errorThrowing2']) {
				assert.ok(id in result.disqualified!)
			}
		})

		it('should not have an error', () => {
			assert.equal(result.error, undefined)
		})

		it('should return results of non-error-throwing strategy', () => {
			assert.ok(result.results !== undefined && Object.keys(result.results).length > 0)
			assert.ok('dumb' in result.results!)
		})

		it('should return strategy timings of non-error-throwing strategy', () => {
			assert.ok(Array.isArray(result.strategyExecutionTimings?.['dumb']))
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok('dumb' in result.strategyLoadingTimings!)
			assert.ok('errorThrowing1' in result.strategyLoadingTimings!)
			assert.ok('errorThrowing2' in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - All strategies cheating', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating2' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating3' }
			], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify all cheating strategies', () => {
			for (const id of ['cheating1', 'cheating2', 'cheating3']) {
				assert.ok(id in result.disqualified!)
			}
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should have an error', () => {
			assert.equal(result.error, ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should not return strategy timings', () => {
			assert.deepEqual(result.strategyExecutionTimings, {})
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok('cheating1' in result.strategyLoadingTimings!)
			assert.ok('cheating2' in result.strategyLoadingTimings!)
			assert.ok('cheating3' in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - All strategies throw errors', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error2' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error3' }
			], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify all strategies', () => {
			for (const id of ['error1', 'error2', 'error3']) {
				assert.ok(id in result.disqualified!)
			}
		})

		it('should have an error', () => {
			assert.equal(result.error, ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should not return strategy timings', () => {
			assert.deepEqual(result.strategyExecutionTimings, {})
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok('error1' in result.strategyLoadingTimings!)
			assert.ok('error2' in result.strategyLoadingTimings!)
			assert.ok('error3' in result.strategyLoadingTimings!)
		})
	})

	describe('Tournament Errors - All strategies problematic', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'error2' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' }
			], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should disqualify all strategies', () => {
			for (const id of ['error1', 'error2', 'cheating1']) {
				assert.ok(id in result.disqualified!)
			}
		})

		it('should have an error', () => {
			assert.equal(result.error, ErrorCategory.ALL_PLAYERS_DISQUALIFIED)
		})

		it('should not return results', () => {
			assert.equal(result.results, undefined)
		})

		it('should not return strategy timings', () => {
			assert.deepEqual(result.strategyExecutionTimings, {})
		})

		it('should return strategy loading timings', () => {
			assert.equal(typeof result.strategyLoadingTimings, 'object')
			assert.ok('error1' in result.strategyLoadingTimings!)
			assert.ok('error2' in result.strategyLoadingTimings!)
			assert.ok('cheating1' in result.strategyLoadingTimings!)
		})
	})
})
