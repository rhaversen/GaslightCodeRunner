/* eslint-disable local/enforce-comment-order */

// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { bundleFiles } from '../../../app/services/gamerunner/bundler.js'
import gameFiles from './utils/meyerGameString.js'
import strategyFiles from './utils/strategyString.js'

// Setup test environment
import '../../testSetup.js'

describe('gameBundler', function () {
	it('should bundle the game files', async function () {
		const bundledCode = await bundleFiles(gameFiles)
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the strategy files', async function () {
		const bundledCode = await bundleFiles(strategyFiles)
		expect(bundledCode).to.be.a('string')
	})
})
