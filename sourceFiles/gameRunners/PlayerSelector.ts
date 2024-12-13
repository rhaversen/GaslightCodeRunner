/* eslint-disable local/enforce-comment-order */
import type { Player } from '../commonTypes.d.ts'
import { shuffle } from './utils.ts'

export class PlayerSelector {
	private selectionStack: Player[] = []
	private usedStack: Player[] = []

	constructor(players: Player[]) {
		this.selectionStack = shuffle([...players])
	}

	/**
	 * Selects a specified number of players.
	 * Replenishes the selection stack from the used stack if necessary.
	 * @param amount Number of players to select
	 * @returns Array of selected players
	 */
	select(amount: number): Player[] {
		if (amount <= 0) return []

		const selectedPlayers: Player[] = []

		while (selectedPlayers.length < amount) {
			// If selection stack is empty, replenish from used stack
			if (this.selectionStack.length === 0) {
				if (this.usedStack.length === 0) {
					break // No more players to select
				}
				this.replenishSelectionStack()
			}

			// Select players from the selection stack
			const needed = amount - selectedPlayers.length
			selectedPlayers.push(...this.selectionStack.splice(0, Math.min(needed, this.selectionStack.length)))
		}

		// Move selected players to the used stack
		this.usedStack.push(...selectedPlayers)

		return selectedPlayers
	}

	/**
	 * Removes a player by their submissionId from both stacks.
	 * @param submissionId ID of the player to remove
	 */
	removePlayer(submissionId: string): void {
		this.selectionStack = this.selectionStack.filter(p => p.submissionId !== submissionId)
		this.usedStack = this.usedStack.filter(p => p.submissionId !== submissionId)
	}

	/**
	 * Replenishes the selection stack by moving all players from the used stack.
	 */
	private replenishSelectionStack(): void {
		this.selectionStack = shuffle(this.usedStack)
		this.usedStack = []
	}
}

export default PlayerSelector
