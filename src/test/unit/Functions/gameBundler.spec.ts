/* eslint-disable local/enforce-comment-order */
 
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { bundleFiles } from '../../../app/services/gamerunner/gameBundler.js'

// Setup test environment
import '../../testSetup.js'

describe('gameBundler', function () {
	it('should bundle the game files', async function () {
		const bundledCode = await bundleFiles()
		expect(bundledCode).to.be.a('string')
	})
})