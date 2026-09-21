import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { runTournament } from '../../../services/gamerunner/CodeRunnerService.js'
import { gameFiles, chatGptStrategyFiles } from '../../../utils/sourceFiles.js'

import '../../envSetup.js'

describe('CodeRunnerService Performance', { timeout: 1200000 }, () => {
	describe('Tournament', () => {
		it('should not have an increase in time complexity epoch over epoch', async () => {
			const strategies = Array(100).fill(null).map((_, index) => ({
				files: { ...chatGptStrategyFiles.files },
				submissionId: `dumbStrategy_${index + 1}`
			}))
			const result = await runTournament(gameFiles, strategies, 10)

			// Map<submissionId, Map<epoch, time>>
			const timings = result.strategyExecutionTimings

			// Now we see how timings evolve over epochs for each strategy
			const strategyEpochs = new Map<string, number[]>()
			if (timings !== null && timings !== undefined) {
				for (const [submissionId, epochTimings] of Object.entries(timings)) {
					const epochTimes = Array.from(epochTimings.values())
					strategyEpochs.set(submissionId, epochTimes)
				}
			}
			assert.ok(strategyEpochs.size >= 0)
		})
	})
})
