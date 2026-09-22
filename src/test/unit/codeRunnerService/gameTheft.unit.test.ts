// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'

import { runTournament, runEvaluation } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	honestStrategyFiles,
	secretiveStrategyFiles,
	strategyStealingGameFiles
} from '../../fixtures/gameFixtures.js'

// Setup test environment
import '../../envSetup.js'

const twoMinuteTimeout = 1200000

// The honest strategy's source contains this unique marker. If it appears in
// ANY result the host would persist or display, a game has read strategy code.
const VICTIM_MARKER = 'VICTIM_SECRET_MARKER_7291'

// Scores the stealing game encodes: -1000 + hash%1000/1000. Real Meyer scores
// from honest play are small negative floats around -0.1..-1, never <= -999.
const STOLEN_SCORE_FLOOR = -999

describe('CodeRunnerService Security — malicious game vs strategies', { timeout: twoMinuteTimeout }, () => {
	describe('game exfiltrating strategy source via honeypot api + stack inspection', () => {
		let result: Awaited<ReturnType<typeof runTournament>>

		before(async () => {
			result = await runTournament(
				strategyStealingGameFiles,
				[honestStrategyFiles, secretiveStrategyFiles],
				10
			)
		})

		it('results must never contain the victim strategy source', () => {
			const serialized = JSON.stringify(result.results) ?? ''
			assert.ok(
				!serialized.includes(VICTIM_MARKER),
				`game exfiltrated strategy source through results: ${serialized.slice(0, 300)}`
			)
		})

		it('scores must never carry the stealing game signature', () => {
			const results = result.results ?? {}
			for (const [id, score] of Object.entries(results)) {
				assert.ok(
					score > STOLEN_SCORE_FLOOR,
					`score of ${id} (${score}) carries encoded exfiltration payload`
				)
			}
		})

		it('disqualification records must never contain the victim source', () => {
			const serialized = JSON.stringify(result.disqualified) ?? ''
			assert.ok(!serialized.includes(VICTIM_MARKER), 'victim source leaked via disqualification records')
		})

		it('error field must never contain the victim source', () => {
			assert.ok(!(result.error ?? '').includes(VICTIM_MARKER), 'victim source leaked via error field')
		})
	})

	describe('same attack through the evaluation path', () => {
		let result: Awaited<ReturnType<typeof runEvaluation>>

		before(async () => {
			result = await runEvaluation(strategyStealingGameFiles, honestStrategyFiles, [secretiveStrategyFiles], 10)
		})

		it('evaluation feedback must never contain the victim source', () => {
			const serialized = JSON.stringify(result) ?? ''
			assert.ok(!serialized.includes(VICTIM_MARKER), 'victim source leaked through evaluation result')
		})
	})
})
