/* eslint-disable local/enforce-comment-order */

/**
 * RunningAverage Module
 *
 * Provides a class to compute the running average incrementally.
 * @description
 * new_average = old_average + (new_value − old_average) / n
 * 
 * Where:
 * - new_average: The updated average after incorporating the new value.
 * - old_average: The average before incorporating the new value.
 * - new_value: The latest score or value being added.
 * - n: The total number of values (rounds) considered so far, including the new value.
 */
export class RunningAverage {
	private count: number
	private average: number

	/**
	 * Initializes a new instance of the RunningAverage class.
	 */
	constructor() {
		this.count = 0
		this.average = 0.0
	}

	/**
	 * Updates the running average with a new value.
	 * 
	 * @param newValue - The new numerical value to include in the average.
	 * @returns The updated running average.
	 */
	public update(newValue: number): number {
		this.count += 1
		// Incremental average calculation
		this.average += (newValue - this.average) / this.count
		return this.average
	}

	/**
	 * Retrieves the current running average.
	 * 
	 * @returns The current running average.
	 */
	public getAverage(): number {
		return this.average
	}

	/**
	 * Retrieves the total number of values included in the average.
	 * 
	 * @returns The count of values.
	 */
	public getCount(): number {
		return this.count
	}

	/**
	 * Resets the running average to its initial state.
	 */
	public reset(): void {
		this.count = 0
		this.average = 0.0
	}
}
