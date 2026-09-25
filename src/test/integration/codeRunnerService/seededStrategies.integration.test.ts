import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	honestStrategyFiles,
	lyingStrategyFiles,
	revealingStrategyFiles,
	detEllerDeroverStrategyFiles,
	statisticsStrategyFiles,
	exampleStrategyFiles
} from '../../fixtures/gameFixtures.js'

import '../../envSetup.js'

// statisticsStrategy and exampleStrategy are part of the seeded database
// content (demo submissions and the user-facing starter template), so they
// must play cleanly through the real pipeline. These tests protect the demo
// experience from regressions the same way the security tests protect the
// sandbox.

const twoMinuteTimeout = 1200000

// Honest Meyer play loses points to penalties, so averages are negative but
// small. Anything outside this band means the strategy misbehaved (e.g. got
// disqualified every epoch, or the game never produced results).
const SANE_SCORE_MIN = -5
const SANE_SCORE_MAX = 0

describe('Seeded demo strategies play cleanly', { timeout: twoMinuteTimeout }, () => {
	it('statisticsStrategy completes a tournament with sane scores', async () => {
		const result = await runTournament(gameFiles, [
			statisticsStrategyFiles,
			dumbStrategyFiles,
			honestStrategyFiles,
			lyingStrategyFiles,
			revealingStrategyFiles,
			detEllerDeroverStrategyFiles
		], { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined, `tournament errored: ${result.error}`)

		const scores = result.results ?? {}
		assert.ok('statistics' in scores, 'statistics strategy missing from results')
		for (const [id, score] of Object.entries(scores)) {
			assert.ok(
				score > SANE_SCORE_MIN && score <= SANE_SCORE_MAX,
				`score of ${id} (${score}) outside sane band`
			)
		}
	})

	it('statisticsStrategy plays at least as well as dumb strategies', async () => {
		const result = await runTournament(gameFiles, [
			statisticsStrategyFiles,
			dumbStrategyFiles,
			dumbStrategyFiles,
			dumbStrategyFiles
		], { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined)
		const scores = result.results ?? {}
		assert.ok('statistics' in scores)

		const dumbScores = Object.entries(scores)
			.filter(([id]) => id.startsWith('dumb'))
			.map(([, score]) => score)
		assert.ok(dumbScores.length > 0, 'no dumb strategies in results')

		const statisticsScore = scores.statistics!
		const dumbAverage = dumbScores.reduce((a, b) => a + b, 0) / dumbScores.length
		// Higher is better (scores are negative penalties). The statistics
		// strategy should not lose to pure randomness.
		assert.ok(
			statisticsScore >= dumbAverage - 0.1,
			`statistics (${statisticsScore.toFixed(4)}) lost badly to dumb average (${dumbAverage.toFixed(4)})`
		)
	})

	it('exampleStrategy completes a tournament with sane scores', async () => {
		const result = await runTournament(gameFiles, [
			exampleStrategyFiles,
			dumbStrategyFiles,
			honestStrategyFiles
		], { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined, `tournament errored: ${result.error}`)

		const scores = result.results ?? {}
		assert.ok('example' in scores, 'example strategy missing from results')
		for (const [id, score] of Object.entries(scores)) {
			assert.ok(
				score > SANE_SCORE_MIN && score <= SANE_SCORE_MAX,
				`score of ${id} (${score}) outside sane band`
			)
		}
	})

	it('all seeded demo strategies survive a tournament together', async () => {
		const result = await runTournament(gameFiles, [
			statisticsStrategyFiles,
			exampleStrategyFiles,
			dumbStrategyFiles,
			honestStrategyFiles,
			lyingStrategyFiles,
			revealingStrategyFiles,
			detEllerDeroverStrategyFiles
		], { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined)

		const disqualified = result.disqualified ?? {}
		assert.deepEqual(disqualified, {}, `demo strategies were disqualified: ${JSON.stringify(disqualified)}`)

		const scores = result.results ?? {}
		for (const id of ['statistics', 'example', 'dumb', 'honest', 'lying', 'revealing', 'detEllerDerover']) {
			assert.ok(id in scores, `${id} missing from results`)
		}
	})
})
