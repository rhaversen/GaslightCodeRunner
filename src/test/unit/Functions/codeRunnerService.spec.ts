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
	dumbStrategyFiles,
	chatGptStrategyFiles,
	detEllerDeroverStrategyFiles,
	honestStrategyFiles,
	lyingStrategyFiles,
	revealingStrategyFiles,
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService', function () {
	this.timeout(twoMinuteTimeout)
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


	it('should run a tournament with 1 strategy', async function () {
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

	it('should run an evaluation with 10 dumb strategies', async function () {
		const strategies = Array(9).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		expect(result.results).to.have.property('candidate')
		expect(result.results).to.have.property('average')
	})

	it('should run an evaluation with 1000 dumb strategies', async function () {
		const strategies = Array(999).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runEvaluation(gameFiles, dumbStrategyFiles, strategies, 10)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		expect(result.results).to.have.property('candidate')
		expect(result.results).to.have.property('average')
	})

	it('should run a tournament with 10 dumb strategies', async function () {
		const strategies = Array(10).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runTournament(gameFiles, strategies, 10)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(Object.keys(result.results!)).to.have.lengthOf(10)
	})

	it('should run a tournament with 1000 dumb strategies', async function () {
		const strategies = Array(1000).fill(null).map((_, index) => ({
			files: { ...dumbStrategyFiles.files },
			submissionId: `dumbStrategy_${index + 1}`
		}))
		const result = await runTournament(gameFiles, strategies, 10)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(result.results).to.not.be.undefined
		expect(Object.keys(result.results!)).to.have.lengthOf(1000)
	})

	it('should run a tournament with all strategies', async function () {
		const strategies = [
			dumbStrategyFiles,
			honestStrategyFiles,
			revealingStrategyFiles,
			detEllerDeroverStrategyFiles,
			chatGptStrategyFiles,
			lyingStrategyFiles
		]
		const result = await runTournament(
			gameFiles,
			strategies,
			10
		)

		expect(result).to.not.be.undefined
		expect(result).to.have.property('results')
		expect(result).to.not.have.property('disqualified')
		expect(result).to.not.have.property('error')
		// It should have a result for each strategy
		expect(Object.keys(result.results!)).to.have.lengthOf(strategies.length)
		// It should have a result for each strategy
		expect(result.results).to.not.be.undefined
		expect(Object.keys(result.results!)).to.have.lengthOf(strategies.length)
		expect(result.results).to.include.all.keys(strategies.map((strategy) => strategy.submissionId))
		// The scores should be unique
		const scores = Object.values(result.results!)
		expect(scores).to.have.lengthOf(new Set(scores).size)
	})
})
