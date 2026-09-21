import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { bundleFiles } from '../../../../services/gamerunner/bundler.js'
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
	errorThrowingStrategyFiles
} from '../../../../utils/sourceFiles.js'

import '../../../envSetup.js'

describe('gameBundler', () => {
	it('should bundle dumb strategy', async () => {
		const bundledCode = await bundleFiles(dumbStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle honest strategy', async () => {
		const bundledCode = await bundleFiles(honestStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle lying strategy', async () => {
		const bundledCode = await bundleFiles(lyingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle cheating strategy', async () => {
		const bundledCode = await bundleFiles(cheatingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle slow strategy', async () => {
		const bundledCode = await bundleFiles(slowStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle detEllerDerover strategy', async () => {
		const bundledCode = await bundleFiles(detEllerDeroverStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle revealing strategy', async () => {
		const bundledCode = await bundleFiles(revealingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle slow loading strategy', async () => {
		const bundledCode = await bundleFiles(slowLoadingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle chatGpt strategy', async () => {
		const bundledCode = await bundleFiles(chatGptStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle non halting loading strategy', async () => {
		const bundledCode = await bundleFiles(nonHaltingLoadingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle non halting strategy', async () => {
		const bundledCode = await bundleFiles(nonHaltingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})

	it('should bundle error throwing strategy', async () => {
		const bundledCode = await bundleFiles(errorThrowingStrategyFiles.files, 'Game')
		assert.equal(typeof bundledCode, 'string')
	})
})
