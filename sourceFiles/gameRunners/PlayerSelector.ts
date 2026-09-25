import type { Player } from '../commonTypes.d.ts'

/**
 * Deterministic player selection for tournament epochs.
 *
 * Uses a rotating sliding window over a stable roster instead of random
 * shuffling. The window advances by one seat per epoch, which gives two
 * fairness properties exactly, by construction rather than by sampling:
 *
 * - Every player occupies every seat position equally often.
 * - Every pair of players meets equally often.
 *
 * Randomized selection made these properties only approximately true, and the
 * residual seat/composition bias does not shrink as epochs grow (it is set by
 * the number of distinct seat/co-player permutations, not by sample count).
 * That bias floor was what made scoring-symmetry tests flaky: they assert
 * near-equality of scores between identical strategies, which random pairing
 * cannot deliver at any epoch count.
 */
export class PlayerSelector {
	private roster: Player[]
	private nextIndex = 0

	constructor (players: Player[]) {
		this.roster = [...players]
	}

	/**
	 * Selects the players for one epoch: the sliding window over the roster.
	 * @param amount Number of players to select
	 * @returns Array of selected players
	 */
	select (amount: number): Player[] {
		if (amount <= 0 || this.roster.length === 0) { return [] }

		const selectedPlayers: Player[] = []
		for (let i = 0; i < amount; i++) {
			selectedPlayers.push(this.roster[(this.nextIndex + i) % this.roster.length])
		}

		// Advance by ONE per epoch (not by amount) so consecutive epochs slide
		// the window by a single seat - that is what makes seat and pairing
		// coverage uniform across epochs.
		this.nextIndex = (this.nextIndex + 1) % this.roster.length

		return selectedPlayers
	}

	/**
	 * Removes a player by their submissionId from the roster.
	 * @param submissionId ID of the player to remove
	 */
	removePlayer (submissionId: string): void {
		const index = this.roster.findIndex(p => p.submissionId === submissionId)
		if (index === -1) { return }
		this.roster.splice(index, 1)
		// Keep the cursor in range after the roster shrank.
		if (this.roster.length > 0) {
			this.nextIndex = this.nextIndex % this.roster.length
		}
	}
}

export default PlayerSelector
