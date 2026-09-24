// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

import { runEvaluation, runTournament, submission } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	chatGptStrategyFiles,
	detEllerDeroverStrategyFiles,
	honestStrategyFiles,
	lyingStrategyFiles,
	revealingStrategyFiles
} from '../../fixtures/gameFixtures.js'

// Setup test environment
import '../../envSetup.js'

const twoMinuteTimeout = 1200000

describe('CodeRunnerService', { timeout: twoMinuteTimeout }, () => {
	describe('Evaluation - 1 candidate and 1 other', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, dumbStrategyFiles, [dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.equal(result.disqualified, null)
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})
	})

	describe('Tournament - 1 strategy', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [dumbStrategyFiles], { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

			it('should error because the roster is below minPlayers', () => {
			assert.match(result.error ?? '', /Not enough players/)
		})

		it('should have no results', () => {
			assert.equal(result.results, undefined)
		})
	})

	describe('Evaluation - 10 dumb strategies', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			const strategies = Array(9).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.equal(result.disqualified, null)
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})

		it('should have candidate results', () => {
			assert.equal(typeof result.results!.candidate, 'number')
		})

		it('should have average results', () => {
			assert.equal(typeof result.results!.average, 'number')
		})
	})

	describe('Evaluation - 1000 dumb strategies', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			const strategies = Array(999).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.equal(result.disqualified, null)
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})

		it('should have candidate results', () => {
			assert.equal(typeof result.results!.candidate, 'number')
		})

		it('should have average results', () => {
			assert.equal(typeof result.results!.average, 'number')
		})
	})

	describe('Tournament - 10 dumb strategies', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			const strategies = Array(10).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runTournament(gameFiles, strategies, { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.deepEqual(result.disqualified, {})
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})

		it('should have a result for each strategy', () => {
			for (let i = 1; i <= 10; i++) {
				assert.ok(`dumbStrategy_${i}` in result.results!)
			}
		})
	})

	describe('Tournament - 1000 dumb strategies', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			const strategies = Array(1000).fill(null).map((_, index) => ({
				files: { ...dumbStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			result = await runTournament(gameFiles, strategies, { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.deepEqual(result.disqualified, {})
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})

		it('should have a result for each strategy', () => {
			for (let i = 1; i <= 1000; i++) {
				assert.ok(`dumbStrategy_${i}` in result.results!)
			}
		})
	})

	describe('Tournament - All strategies', () => {
		let result: Awaited<ReturnType<typeof runTournament>>
		let strategies: submission[]

		before(async () => {
			strategies = [
				dumbStrategyFiles,
				honestStrategyFiles,
				revealingStrategyFiles,
				detEllerDeroverStrategyFiles,
				chatGptStrategyFiles,
				lyingStrategyFiles
			]
			result = await runTournament(gameFiles, strategies, { minPlayers: 2, maxPlayers: 10 })
		})

		it('should not be undefined', () => {
			assert.notEqual(result, undefined)
		})

		it('should have results', () => {
			assert.equal(typeof result.results, 'object')
		})

		it('should have no disqualified players', () => {
			assert.deepEqual(result.disqualified, {})
		})

		it('should have no error', () => {
			assert.equal(result.error, undefined)
		})

		it('should have a result for each strategy', () => {
			for (const strategy of strategies) {
				assert.ok(strategy.submissionId in result.results!)
			}
		})

		it('should include all strategy submission IDs', () => {
			for (const strategy of strategies) {
				assert.ok(strategy.submissionId in result.results!)
			}
		})

		it('should have unique scores for each strategy', () => {
			const scores = Object.values(result.results!)
			assert.equal(scores.length, new Set(scores).size)
		})
	})
})
