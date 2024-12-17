// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { runEvaluation } from '../../../app/services/gamerunner/CodeRunnerService.js'
import {
	gameFiles,
	slowStrategyFiles,
	slowLoadingStrategyFiles,
	dumbStrategyFiles,
	nonHaltingLoadingStrategyFiles,
	nonHaltingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService Timeouts', function () {
	this.timeout(twoMinuteTimeout)

	it('should return an error when the candidate takes too long during evaluation', async function () {
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
		expect(result.error?.toLowerCase()).to.not.include('script')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal('slow')
		expect(result.error?.toLowerCase()).to.include('strategy execution timed out')
	})

	it('should return an error when the candidate never halts during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			nonHaltingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.error?.toLowerCase()).to.include('script')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal(nonHaltingStrategyFiles.submissionId)
		expect(result.error?.toLowerCase()).to.include('timed out')
	})

	it('should return an error when the candidate takes too long to load during evaluation', async function () {
		const result = await runEvaluation(
			gameFiles,
			slowLoadingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.error?.toLowerCase()).to.not.include('script')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal(slowLoadingStrategyFiles.submissionId)
		expect(result.error?.toLowerCase()).to.include('strategy execution timed out')
	})

	it('should return an error when the candidate never halts during loading', async function () {
		const result = await runEvaluation(
			gameFiles,
			nonHaltingLoadingStrategyFiles,
			[dumbStrategyFiles],
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.not.have.property('results')
		expect(result).to.have.property('disqualified')
		expect(result).to.have.property('error')
		expect(result.error?.toLowerCase()).to.include('script')
		expect(result.disqualified).to.have.lengthOf(1)
		expect(result.disqualified![0]).to.equal(nonHaltingLoadingStrategyFiles.submissionId)
		expect(result.error?.toLowerCase()).to.include('timed out')
	})

})
