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
import { gameFiles, strategyFiles } from '../../../app/utils/sourceFiles.js'

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService', function () {
	it('should run a game session with one strategy', async function () {
		const result = await runGame(
			gameFiles,
			[strategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
	})

	it('should run a game session with two strategies', async function () {
		const result = await runGame(
			gameFiles,
			[strategyFiles, strategyFiles],
			'Evaluation'
		)

		expect(result).to.not.be.undefined
	})

	it('should finish a game session with no errors', async function () {
		const result = await runGame(
			gameFiles,
			[strategyFiles, strategyFiles],
			'Evaluation'
		)
		console.log(result)
		expect(result).to.not.be.undefined
	})
})
