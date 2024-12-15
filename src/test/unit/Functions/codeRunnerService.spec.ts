// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runEvaluation, runTournament } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	cheatingStrategyFiles,
	slowStrategyFiles,
	dumbStrategyFiles,
	errorThrowingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService', function () {
	it('should run a an evaluation with 1 candidate and 1 other', async function () {
		const result = await runEvaluation(
			gameFiles,
			dumbStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should disqualify a strategy that throws an error during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			cheatingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('cheating')
	})

	it('should include the message when disqualifying a strategy during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			cheatingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result.error).to.be.a('string')
	})

	it('should timeout a strategy that takes too long during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			slowStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('slow')
		expect(result.error).to.include('timed out')
	})

	it('should disqualify a strategy that throws an error during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			errorThrowingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('errorThrowing')
	})

	it('should not throw an error when other strategies are disqualified during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			dumbStrategyFiles,
			[errorThrowingStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('error')
		expect(result).to.not.have.property('disqualified')
	})

	it('should not throw an error when other strategies cheat during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			dumbStrategyFiles,
			[cheatingStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('error')
		expect(result).to.not.have.property('disqualified')
	})

	it('should have an error when running a tournament with no strategies', async function () {
		const result = await runTournament(
			gameFiles,
			[],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.have.property('error')
	})

	it('should run a tournament with 1 strategy', async function () {
		this.timeout(twoMinuteTimeout)
		const result = await runTournament(
			gameFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should run a tournament with 2 strategies', async function () {
		this.timeout(twoMinuteTimeout)
		const result = await runTournament(
			gameFiles,
			[dumbStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
	})

	it('should disqualify a strategy that throws an error during a tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const result = await runTournament(
			gameFiles,
			[cheatingStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('disqualified')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('cheating')
	})

	it('should not have an error when disqualifying a strategy during a tournament', async function () {
		const result = await runTournament(
			gameFiles,
			[cheatingStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result.error).to.be.undefined
	})

	it('should not disqualify any other strategies than the cheating strategy during a tournament', async function () {
		const result = await runTournament(
			gameFiles,
			[cheatingStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result.disqualified).to.not.include('dumb')
	})

	it('should timeout a strategy that takes too long during a tournament', async function () {
		this.timeout(twoMinuteTimeout)
		const result = await runTournament(
			gameFiles,
			[slowStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('slow')
		expect(result.error).to.include('timed out')
	})

	it('should disqualify all strategies that cheat during a tournament', async function () {
		const result = await runTournament(
			gameFiles,
			[
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating1' },
				{ files: cheatingStrategyFiles.files, submissionId: 'cheating2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
			],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('disqualified')
		expect(result.disqualified).to.have.lengthOf(2)
		expect(result.disqualified).to.include.members(['cheating1', 'cheating2'])
	})

	it('should disqualify a strategy that throws an error during a tournament', async function () {
		const result = await runTournament(
			gameFiles,
			[errorThrowingStrategyFiles, dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('disqualified')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('errorThrowing')
	})

	it('should disqualify all strategies that throw an error during a tournament', async function () {
		const result = await runTournament(
			gameFiles,
			[
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing1' },
				{ files: errorThrowingStrategyFiles.files, submissionId: 'errorThrowing2' },
				{ files: dumbStrategyFiles.files, submissionId: 'dumb' },
			],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('disqualified')
		expect(result.disqualified).to.have.lengthOf(2)
		expect(result.disqualified).to.include.members(['errorThrowing1', 'errorThrowing2'])
	})
})
