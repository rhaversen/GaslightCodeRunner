import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runEvaluation, runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import { gameFiles, dumbStrategyFiles } from '../../fixtures/gameFixtures.js'

import '../../envSetup.js'

const twoMinuteTimeout = 1200000

function dumb (id: string) {
	return { files: { ...dumbStrategyFiles.files }, submissionId: id }
}

describe('Game player bounds (minPlayers/maxPlayers)', { timeout: twoMinuteTimeout }, () => {
	it('tournament errors when the roster is below minPlayers', async () => {
		const result = await runTournament(gameFiles, [dumb('d1')], { minPlayers: 2, maxPlayers: 10 })

		assert.ok(result.error !== undefined)
		assert.match(result.error, /Not enough players/)
		assert.equal(result.results, undefined)
	})

	it('tournament seats fewer than maxPlayers when the roster is small', async () => {
		// Meyer runs fine with 3 players even when maxPlayers is 10
		const result = await runTournament(gameFiles, [dumb('d1'), dumb('d2'), dumb('d3')], { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined)
		assert.equal(Object.keys(result.results ?? {}).length, 3)
	})

	it('evaluation backfills the table with duplicate seats when the roster is below minPlayers', async () => {
		// 1 opponent + candidate = 2 seats; minPlayers 5 forces 3 duplicate seats
		const result = await runEvaluation(gameFiles, dumb('candidate'), [dumb('opponent1')], { minPlayers: 5, maxPlayers: 10 })

		assert.equal(result.error, undefined)
		assert.ok(result.results !== undefined)
		// Duplicate seats preserve symmetry: identical strategies score alike
		assert.ok(Math.abs(result.results.candidate - result.results.average) < 0.01)
	})

	it('evaluation uses the whole roster when it is below maxPlayers', async () => {
		const others = [dumb('o1'), dumb('o2'), dumb('o3'), dumb('o4')]
		const result = await runEvaluation(gameFiles, dumb('candidate'), others, { minPlayers: 2, maxPlayers: 10 })

		assert.equal(result.error, undefined)
		assert.ok(Math.abs(result.results!.candidate - result.results!.average) < 0.01)
	})
})
