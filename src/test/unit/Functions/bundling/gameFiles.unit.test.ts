import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { bundleFiles } from '../../../../services/gamerunner/bundler.js'
import { evaluatingGameRunnerFiles, tournamentGameRunnerFiles } from '../../../../utils/sourceFiles.js'
import { gameFiles } from '../../../fixtures/gameFixtures.js'

import '../../../envSetup.js'

describe('gameBundler', () => {
	it('should bundle the game files', async () => {
		const bundledCode = await bundleFiles(gameFiles, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle the tournament game runner files', async () => {
		const bundledCode = await bundleFiles(tournamentGameRunnerFiles, 'TournamentGameRunner')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle the evaluating game runner files', async () => {
		const bundledCode = await bundleFiles(evaluatingGameRunnerFiles, 'EvaluatingGameRunner')
		assert.equal(typeof bundledCode, 'string')
	})
})
