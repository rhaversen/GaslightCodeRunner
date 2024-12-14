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
	cheatingStrategyFiles,
	slowStrategyFiles,
	dumbStrategyFiles,
} from '../../../app/utils/sourceFiles.js'
import { EvaluationResults } from '../../../../sourceFiles/gameRunners/types.js'

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService', function () {
	it('should have an error when running an evaluation with only a candidate', async function () {
		const result = await runGame(
			gameFiles,
			[dumbStrategyFiles],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.have.property('error')
	})

	it('should run a an evaluation with two strategies', async function () {
		const result = await runGame(
			gameFiles,
			[dumbStrategyFiles, dumbStrategyFiles],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should have an error when running an evaluation with no strategies', async function () {
		const result = await runGame(
			gameFiles,
			[],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.have.property('error')
	})

	it('should disqualify a strategy that throws an error', async function () {
		const result = await runGame(
			gameFiles,
			[cheatingStrategyFiles],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.be.a('string')
	})

	it('should include the message when disqualifying a strategy', async function () {
		const result = await runGame(
			gameFiles,
			[cheatingStrategyFiles],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result.error).to.be.a('string')
	})

	it('should timeout a strategy that takes too long', async function () {
		const result = await runGame(
			gameFiles,
			[slowStrategyFiles],
			'Evaluation',
			10
		) as EvaluationResults

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.error).to.include('timed out')
	})
})

