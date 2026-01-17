// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import { expect } from 'chai'
import { describe, it } from 'mocha'

import { bundleFiles } from '../../../../app/services/gamerunner/bundler.js'
import {
	gameFiles,
	tournamentGameRunnerFiles,
	evaluatingGameRunnerFiles
} from '../../../../app/utils/sourceFiles.js'

import '../../../testSetup.js'

describe('gameBundler', function () {
	it('should bundle the game files', async function () {
		const bundledCode = await bundleFiles(gameFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the tournament game runner files', async function () {
		const bundledCode = await bundleFiles(tournamentGameRunnerFiles, 'TournamentGameRunner')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the evaluating game runner files', async function () {
		const bundledCode = await bundleFiles(evaluatingGameRunnerFiles, 'EvaluatingGameRunner')
		expect(bundledCode).to.be.a('string')
	})
})
