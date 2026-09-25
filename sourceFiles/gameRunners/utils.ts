/**
 * Inserts an item into an array at a random index in O(1) time.
 * @param arr - The array to insert into.
 * @param item - The item to insert.
 * @returns The array with the item inserted.
 */
export function insertRandomly<T> (arr: T[], item: T): T[] {
	// Step 1: Append the item to the end of the array
	arr.push(item)

	// Step 2: Generate a random index in the range [0, arr.length - 1]
	const randomIndex = Math.floor(Math.random() * arr.length)

	// Step 3: Swap the newly added item with the random index
	const lastIndex = arr.length - 1;
	[arr[randomIndex], arr[lastIndex]] = [arr[lastIndex], arr[randomIndex]]

	return arr
}
