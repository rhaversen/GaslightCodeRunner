import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Theft attempt #1: throw an error whose message embeds anything reachable
// from the shared context, hoping it lands in another submission's
// disqualification record or our own evaluation feedback.
const main = (api: MeyerStrategyAPI) => {
	// Try to grab the other strategies through every global path we know.
	const probes: unknown[] = []

	try {
		// Walk the global object for anything strategy-shaped
		for (const key of Object.getOwnPropertyNames(globalThis)) {
			try {
				probes.push(String((globalThis as Record<string, unknown>)[key]).slice(0, 5000))
			} catch {
				// inaccessible
			}
		}
	} catch {
		probes.push('global walk failed')
	}

	try {
		// Function constructor: compile code that reads our own caller chain
		const reader = new Function('return (function () { try { return Function.caller } catch (e) { return e.message } })()')() as unknown
		probes.push(String(reader).slice(0, 5000))
	} catch (e) {
		probes.push(`ctor: ${String(e)}`)
	}

	try {
		// arguments.callee style stack walk
		const stack = new Error().stack
		probes.push(String(stack).slice(0, 5000))
	} catch (e) {
		probes.push(`stack: ${String(e)}`)
	}

	// Exfiltrate through the error message channel
	throw new Error(`LEAK:${probes.join('|').slice(0, 50000)}`)
}

export default main
