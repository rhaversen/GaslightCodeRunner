import './securityBootstrap.ts'
import type { Game, Player } from '../commonTypes.d.ts'

import PlayerSelector from './PlayerSelector.ts'
import { RunningAverage } from './RunningAverage.ts'
import type { VMResults } from './types.d.ts'

export class Main {
	static run (gameFactory: () => Game, players: Player[], numEpochs: number, tableSize: { minPlayers: number, maxPlayers: number }): VMResults {
		console.info(`Running evaluation with ${players.length} players`)

		if (players.length === 0) { return { error: 'No players provided' } }

		// Initialize RunningAverage instances
		const candidateAverage = new RunningAverage()
		const othersAverage = new RunningAverage()
		const turnsAverage = new RunningAverage()
		let maxTurnCount = 0

		// Separate candidate from other players
		const [candidate, ...otherPlayers] = players
		if (!candidate) { return { error: 'No candidate player provided' } }
		if (!otherPlayers.length) { return { error: 'No other players provided' } }

		// Evaluation is per-candidate, so unlike a tournament it may backfill the
		// table with duplicates of other submissions when the roster is smaller
		// than the game's minimum: duplicate seats run the same strategy code but
		// under distinct seat IDs, each in a fresh VM per epoch.
		const seatTarget = Math.min(tableSize.maxPlayers, Math.max(tableSize.minPlayers, otherPlayers.length + 1))

		// Create player selector instance for other players
		const playerSelector = new PlayerSelector(otherPlayers)

		for (let epoch = 0; epoch < numEpochs; epoch++) {
			// Create fresh game instance for each epoch
			const gameInstance = gameFactory()

			// Select players for the current epoch
			const selectedPlayers = playerSelector.select(Math.min(seatTarget - 1, otherPlayers.length)).map(player => ({
				...player,
				epoch
			}))

			// Backfill remaining seats with duplicates of the selected opponents,
			// cycled round-robin so no single strategy's code is over-weighted by
			// the fill order. Each copy gets a unique seat ID so getResults()
			// returns one entry per seat.
			for (let seat = selectedPlayers.length; selectedPlayers.length + 1 < seatTarget; seat++) {
				const source = selectedPlayers[seat % Math.max(selectedPlayers.length, 1)]
				if (source === undefined) { break }
				selectedPlayers.push({
					...source,
					submissionId: `${source.submissionId}#${seat}`
				})
			}

			// Rotate the candidate's seat deterministically: one seat per epoch.
			// Random placement made the candidate's average depend on seat luck
			// with a bias floor that never shrinks; rotation gives every seat
			// exactly equal coverage, so candidate and opponents average over
			// identical seat distributions.
			const candidateSeat = epoch % (selectedPlayers.length + 1)
			const activePlayers = [...selectedPlayers]
			activePlayers.splice(candidateSeat, 0, { ...candidate, epoch })

			try {
				gameInstance.init(activePlayers)
			} catch (error) {
				return { error: error instanceof Error ? error.message : 'Game initialization failed' }
			}

			try {
				gameInstance.playRound()
				const results = gameInstance.getResults()
				const stats = gameInstance.getStats ? gameInstance.getStats() : undefined
				const turnCount = stats?.turnCount ?? 0

				// Get the candidate's score
				const candidateScore = results.get(candidate.submissionId) ?? 0

				// Get the scores of other players
				const otherScores: number[] = []
				const targetId = candidate.submissionId
				for (const entry of results) {
					const id = entry[0]
					const score = entry[1]
					if (id !== targetId) {
						otherScores.push(score)
					}
				}

				// Calculate average score of other players. Empty is possible when an
				// opponent shares the candidate's submissionId (its score is excluded);
				// count that seat for nobody rather than propagating NaN.
				const averageOtherScore = otherScores.length > 0
					? otherScores.reduce((a, b) => a + b, 0) / otherScores.length
					: 0

				// Update max turn count
				maxTurnCount = Math.max(maxTurnCount, turnCount)

				// Update running averages
				turnsAverage.update(turnCount)
				candidateAverage.update(candidateScore)
				othersAverage.update(averageOtherScore)
			} catch (error) {
				// Check if the error is a disqualification
				if (error && typeof error === 'object' && error.submissionId !== undefined) {
					// Report the disqualification
					console.warn(`Player ${error.submissionId} disqualified: ${error.message}`)
					if (error.submissionId === candidate.submissionId) {
						return { disqualified: { [candidate.submissionId]: error.message } }
					}

					// Remove disqualified player
					playerSelector.removePlayer(error.submissionId)

					// Decrement epoch to ensure we run the same number of epochs
					epoch--
				} else {
					console.error(`Error executing player turn: ${error}`)
					return { error: error instanceof Error ? error.message : 'Game execution failed' }
				}
			}
		}

		console.info(`Average turns: ${turnsAverage.getAverage().toFixed(2)}`)
		console.info(`Max turns: ${maxTurnCount}`)

		// Prepare the final results
		const totalResults = {
			candidate: candidateAverage.getAverage(),
			average: othersAverage.getAverage()
		}
		return { results: totalResults }
	}
}

export default Main
