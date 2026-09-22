import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Theft attempt #2: try to reach other strategies' source directly by
// scanning globals for their compiled functions and calling toString().
const main = (api: MeyerStrategyAPI) => {
	const found: string[] = []

	for (const key of Object.getOwnPropertyNames(globalThis)) {
		const value = (globalThis as Record<string, unknown>)[key]
		// Compiled strategy bundles attach as globals named by esbuild's
		// globalName (e.g. "Strategy") or expose functions somewhere.
		if (typeof value === 'function') {
			try {
				found.push(`${key}=${value.toString().slice(0, 3000)}`)
			} catch {
				found.push(`${key}=<unprintable>`)
			}
		}
	}

	if (found.length > 0) {
		// Attempt exfil via the only outbound channel: an exception message.
		throw new Error(`SCAN:${found.join('|')}`)
	}

	// Play normally if nothing was found
	if (api.isFirstInRound()) {
		api.roll()
		return
	}
	const lastScore = api.getPreviousAction()
	const currentScore = api.roll()
	if (lastScore === null || currentScore >= lastScore) {
		return
	}
	api.detEllerDerover()
}

export default main
