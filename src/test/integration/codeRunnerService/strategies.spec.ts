/* eslint-disable local/enforce-comment-order */

// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runGame } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	dumbStrategyFiles,
	honestStrategyFiles,
	revealingStrategyFiles,
	detEllerDeroverStrategyFiles
} from '../../../app/utils/sourceFiles.js'

// Setup test environment
import '../../testSetup.js'

describe('Running games with different strategies', function () {
	it('should run a game with all strategies', async function () {
		const result = await runGame(
			gameFiles,
			[dumbStrategyFiles, honestStrategyFiles, revealingStrategyFiles, detEllerDeroverStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with detEllerDerover and revealing strategies', async function () {
		const result = await runGame(
			gameFiles,
			[detEllerDeroverStrategyFiles, revealingStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with detEllerDerover and honest strategies', async function () {
		const result = await runGame(
			gameFiles,
			[detEllerDeroverStrategyFiles, honestStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with detEllerDerover and dumb strategies', async function () {
		const result = await runGame(
			gameFiles,
			[detEllerDeroverStrategyFiles, dumbStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with revealing and honest strategies', async function () {
		const result = await runGame(
			gameFiles,
			[revealingStrategyFiles, honestStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with revealing and dumb strategies', async function () {
		const result = await runGame(
			gameFiles,
			[revealingStrategyFiles, dumbStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a game with honest and dumb strategies', async function () {
		const result = await runGame(
			gameFiles,
			[honestStrategyFiles, dumbStrategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})
})
