// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { bundleFiles } from '../../../../app/services/gamerunner/bundler.js'
import {
	dumbStrategyFiles,
	honestStrategyFiles,
	lyingStrategyFiles,
	cheatingStrategyFiles,
	slowStrategyFiles,
	detEllerDeroverStrategyFiles,
	revealingStrategyFiles
} from '../../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

// Setup test environment
import '../../../testSetup.js'

describe('gameBundler', function () {
	it('should bundle dumb strategy', async function () {
		const bundledCode = await bundleFiles(dumbStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle honest strategy', async function () {
		const bundledCode = await bundleFiles(honestStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle lying strategy', async function () {
		const bundledCode = await bundleFiles(lyingStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle cheating strategy', async function () {
		const bundledCode = await bundleFiles(cheatingStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle slow strategy', async function () {
		const bundledCode = await bundleFiles(slowStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle detEllerDerover strategy', async function () {
		const bundledCode = await bundleFiles(detEllerDeroverStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle revealing strategy', async function () {
		const bundledCode = await bundleFiles(revealingStrategyFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})
})
