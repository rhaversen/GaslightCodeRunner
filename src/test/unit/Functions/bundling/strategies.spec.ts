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
	revealingStrategyFiles,
	slowLoadingStrategyFiles,
	chatGptStrategyFiles,
	nonHaltingLoadingStrategyFiles,
	nonHaltingStrategyFiles,
	errorThrowingStrategyFiles,
} from '../../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables

// Setup test environment
import '../../../testSetup.js'

describe('gameBundler', function () {
	it('should bundle dumb strategy', async function () {
		const bundledCode = await bundleFiles(dumbStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle honest strategy', async function () {
		const bundledCode = await bundleFiles(honestStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle lying strategy', async function () {
		const bundledCode = await bundleFiles(lyingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle cheating strategy', async function () {
		const bundledCode = await bundleFiles(cheatingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle slow strategy', async function () {
		const bundledCode = await bundleFiles(slowStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle detEllerDerover strategy', async function () {
		const bundledCode = await bundleFiles(detEllerDeroverStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle revealing strategy', async function () {
		const bundledCode = await bundleFiles(revealingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle slow loading strategy', async function () {
		const bundledCode = await bundleFiles(slowLoadingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle chatGpt strategy', async function () {
		const bundledCode = await bundleFiles(chatGptStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle non halting loading strategy', async function () {
		const bundledCode = await bundleFiles(nonHaltingLoadingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle non halting strategy', async function () {
		const bundledCode = await bundleFiles(nonHaltingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle error throwing strategy', async function () {
		const bundledCode = await bundleFiles(errorThrowingStrategyFiles.files, 'Game')
		expect(bundledCode).to.be.a('string')
	})
})
