import type { Player } from './commonTypes.d.ts'
import { PlayerError } from './errors.ts'

// Re-exported so games using the guard can construct attributed PlayerErrors
// without a second import path.
export { PlayerError }

/**
 * Guarded strategy invocation, shared by all games via commonGameFiles.
 *
 * Games receive each player's strategy as a function and invoke it once per
 * turn with an api object. Two abuse vectors exist around that hand-off, and
 * every game would have to defend them individually — so the defense lives
 * here instead:
 *
 * 1. Ownership: a strategy that kept a reference to an api object from an
 *    earlier turn (its own or, via a second strategy, another player's) can
 *    try to act outside its own turn. createGuardedApiCall tags every api
 *    with its owner; invoking with the wrong tag is a PlayerError attributed
 *    to the player whose turn it was — the one attempting the theft.
 *
 * 2. Delegation: games must route every strategy invocation through
 *    callGuarded instead of calling player.strategy directly, so the check
 *    cannot be forgotten or bypassed by game code that "just calls it once".
 */

const OWNER_TAG = '__ownerId'

/**
 * Tag an api object with the submissionId it was created for. Games call this
 * once per turn, right after building the api, and pass the result to
 * callGuarded. The tag is non-enumerable so it does not appear in spreads or
 * JSON of the api — a strategy copying the api to reuse later still carries
 * the tag, which is exactly what makes reuse detectable.
 */
export function tagApi<T extends object> (api: T, ownerSubmissionId: string): T {
	try {
		Object.defineProperty(api, OWNER_TAG, { value: ownerSubmissionId, enumerable: false, writable: false, configurable: false })
	} catch {
		// A frozen api cannot be tagged; the game then cannot use callGuarded
		// for it, which callGuarded will report when invoked.
	}
	return api
}

/**
 * Invoke a player's strategy with an api previously tagged via tagApi.
 *
 * - Wrong or missing owner tag → PlayerError attributed to the current
 *   player (the one whose turn it is — they attempted the invalid use).
 * - PlayerErrors thrown BY the strategy propagate unchanged (game validation
 *   feedback stays actionable and is attributed via the game's own throw).
 * - Any other thrown error is rethrown as-is; the runner's strategy wrapper
 *   sanitizes it before it can reach any result the host persists.
 */
export function callGuarded (player: Player, api: object, currentSubmissionId: string): void {
	const tag = (api as Record<string, unknown>)[OWNER_TAG]
	if (typeof tag !== 'string' || tag !== currentSubmissionId) {
		throw new PlayerError('A strategy attempted to use an API that was not created for its turn.', currentSubmissionId)
	}
	player.strategy(api)
}
