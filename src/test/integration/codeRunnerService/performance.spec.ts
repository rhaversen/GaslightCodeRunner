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
	chatGptStrategyFiles
} from '../../../app/utils/sourceFiles.js'

// Environment variables

// Config variables

// Destructuring and global variables
const twoMinuteTimeout = 1200000

// Setup test environment
import '../../testSetup.js'

describe('CodeRunnerService Performance', function () {
	this.timeout(twoMinuteTimeout)
	describe('Tournament', function () {

		it('should not have an increase in time complexity epoch over epoch', async function () {
			const strategies = Array(100).fill(null).map((_, index) => ({
				files: { ...chatGptStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runTournament(gameFiles, strategies, 10)
			// Map<string, Map<number, number>>();
			// Map<submissionId, Map<epoch, time>>
			const timings = result.strategyTimings
			console.log('timings', timings)

			// Now we see how timings evolve over epochs for each strategy
			const strategyEpochs = new Map<string, number[]>()
			if (timings) {
				for (const [submissionId, epochTimings] of timings) {
					const epochTimes = Array.from(epochTimings.values())
					strategyEpochs.set(submissionId, epochTimes)
				}
			}

			console.log('strategyEpochs', strategyEpochs.get('dumbStrategy_1'))
		})
	})
})
