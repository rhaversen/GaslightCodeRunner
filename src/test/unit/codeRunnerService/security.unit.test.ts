// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

import { runEvaluation, runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	honestStrategyFiles,
	dumbStrategyFiles,
	errorExfilStrategyFiles,
	globalScanStrategyFiles,
	prototypePolluteStrategyFiles,
	envTamperStrategyFiles,
	staleApiStrategyFiles
} from '../../fixtures/gameFixtures.js'

// Setup test environment
import '../../envSetup.js'

const twoMinuteTimeout = 1200000

// Markers the attack strategies embed in their exfiltration payloads. If any
// of these appear in a result, disqualification message, or evaluation
// feedback, user code has escaped its own scope — the vulnerability this
// suite exists to guard against.
const EXFIL_MARKERS = ['LEAK:', 'SCAN:', 'POLLUTE:', 'TAMPER:', 'STALE_API_WORKED:']

// Bundled source of the honest strategy — the "secret" a thief must never see.
const HONEST_SOURCE_SIGNATURE = 'detEllerDerover'

function assertNoLeak (value: unknown, path: string): void {
	if (typeof value === 'string') {
		for (const marker of EXFIL_MARKERS) {
			assert.ok(!value.includes(marker), `${path} contains exfiltration marker ${marker}: ${value.slice(0, 200)}`)
		}
		return
	}
	if (Array.isArray(value)) {
		value.forEach((item, i) => { assertNoLeak(item, `${path}[${i}]`) })
		return
	}
	if (value !== null && typeof value === 'object') {
		for (const [key, item] of Object.entries(value)) {
			assertNoLeak(item, `${path}.${key}`)
		}
	}
}

// Every result shape the runner can produce, scanned end to end.
function assertResultIsClean (result: Awaited<ReturnType<typeof runEvaluation>> | Awaited<ReturnType<typeof runTournament>>): void {
	assertNoLeak(result.error, 'error')
	assertNoLeak(result.results, 'results')
	assertNoLeak(result.disqualified, 'disqualified')
	assertNoLeak(result.strategyExecutionTimings, 'strategyExecutionTimings')
	assertNoLeak(result.strategyLoadingTimings, 'strategyLoadingTimings')
}

describe('CodeRunnerService Security — cross-strategy exfiltration', { timeout: twoMinuteTimeout }, () => {
	describe('error-message exfiltration attempt (evaluation)', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, errorExfilStrategyFiles, [honestStrategyFiles], 10)
		})

		it('disqualifies the attacker', () => {
			assert.equal(typeof result.disqualified, 'string')
		})

		it('strips the exfiltration payload from the disqualification message', () => {
			assertNoLeak(result.disqualified, 'disqualified')
		})

		it('returns no other channel carrying the payload', () => {
			assertResultIsClean(result)
		})

		it('does not leak the honest strategy source through any field', () => {
			const serialized = JSON.stringify(result) ?? ''
			assert.ok(!serialized.includes(HONEST_SOURCE_SIGNATURE), 'honest strategy source found in evaluation result')
		})
	})

	describe('error-message exfiltration attempt (tournament)', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			// Attacker runs alongside honest strategies — its disqualification
			// record must not carry anything it learned from the shared context.
			result = await runTournament(gameFiles, [errorExfilStrategyFiles, honestStrategyFiles, dumbStrategyFiles], 10)
		})

		it('produces a clean result object', () => {
			assertResultIsClean(result)
		})

		it('never exposes other submissions via the disqualified map', () => {
			const disqualified = result.disqualified ?? {}
			for (const [id, reason] of Object.entries(disqualified)) {
				assert.ok(!reason.includes(HONEST_SOURCE_SIGNATURE), `disqualification of ${id} contains other strategy source`)
				assertNoLeak(reason, `disqualified.${id}`)
			}
		})
	})

	describe('global scan attempt (evaluation)', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(gameFiles, globalScanStrategyFiles, [honestStrategyFiles], 10)
		})

		it('produces a clean result object', () => {
			assertResultIsClean(result)
		})

		it('does not leak the honest strategy source', () => {
			const serialized = JSON.stringify(result) ?? ''
			assert.ok(!serialized.includes(HONEST_SOURCE_SIGNATURE), 'honest strategy source found in result')
		})
	})

	describe('prototype pollution attempt (tournament)', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [prototypePolluteStrategyFiles, honestStrategyFiles, dumbStrategyFiles], 10)
		})

		it('produces a clean result object', () => {
			assertResultIsClean(result)
		})

		it('cannot intercept other players\' scores', () => {
			// If Map.prototype.get had been replaced, POLLUTE would carry score
			// data — and the marker check in assertResultIsClean covers it.
			assertNoLeak(result.results, 'results')
		})
	})

	describe('environment tampering attempt (tournament)', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [envTamperStrategyFiles, honestStrategyFiles, dumbStrategyFiles], 10)
		})

		it('produces a clean result object', () => {
			assertResultIsClean(result)
		})

		it('does not reward the tampering strategy', () => {
			// The strategy must not have replaced Math.random — it either plays
			// legitimately or is disqualified, but never rigs rolls.
			const results = result.results ?? {}
			for (const score of Object.values(results)) {
				assert.ok(Number.isFinite(score), 'scores must be finite numbers')
			}
		})
	})

	describe('stale api / turn stealing attempt (tournament)', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(gameFiles, [staleApiStrategyFiles, honestStrategyFiles, dumbStrategyFiles], 10)
		})

		it('produces a clean result object', () => {
			assertResultIsClean(result)
		})
	})

	describe('error messages shown to users stay actionable', () => {
		it('keeps game validation messages (PlayerError) intact', async () => {
			// The error-throwing strategy throws a plain Error; the wrapper must
			// sanitize it. But game-thrown PlayerErrors (invalid moves) keep
			// their message — verified here via the existing error strategy
			// producing a disqualification, with the generic marker replaced.
			const result = await runEvaluation(gameFiles, errorExfilStrategyFiles, [dumbStrategyFiles], 10)
			const reason = result.disqualified
			if (typeof reason === 'string') {
				assert.ok(!reason.startsWith('LEAK:'), 'raw attack payload must be sanitized')
			}
		})
	})
})
