/**
 * Security bootstrap, evaluated inside the VM before any game or strategy
 * code runs. Two phases:
 *
 * Phase 1 (here, at bundle load): seals the stack-inspection channels and the
 * shared builtins.
 *
 * - Pins Error.prepareStackTrace to a fixed formatter. V8 reads it at .stack
 *   access time; an attacker who can replace it with (err, cs) => cs receives
 *   raw CallSite objects, and CallSite.getFunction() returns the LIVE function
 *   of every frame on the stack — the caller's closure — even when
 *   Function.prototype.caller/arguments are trapped. Both properties are
 *   therefore made non-writable and non-configurable, which makes the
 *   CallSite objects unreachable from untrusted code.
 * - Seals Error.captureStackTrace, the alternate route to the same frames.
 * - Traps Function.prototype.caller/arguments as defense in depth.
 * - Freezes Math/JSON/Reflect and core prototypes so neither games nor
 *   strategies can rig dice (Math.random), corrupt shared control flow
 *   (Map/Set/Array prototypes), or hijack JSON serialization.
 *
 * Phase 2 (__hardenGlobals, called by the test script after the trusted game
 * and runner bundles are defined but BEFORE any strategy code loads): seals
 * console/performance against replacement and freezes globalThis so
 * strategies can neither add nor replace globals.
 */

(function () {
	// Must be set BEFORE making the property non-writable. The fixed formatter
	// reproduces the default stack string; it never hands out CallSite objects.
	Error.prepareStackTrace = (err, stackFrames) => err.stack ?? String(err)
	Object.defineProperty(Error, 'prepareStackTrace', { writable: false, configurable: false })
	Object.defineProperty(Error, 'captureStackTrace', { writable: false, configurable: false })

	const trapped = function () {
		throw new TypeError('Illegal access')
	}

	try {
		Object.defineProperty(Function.prototype, 'caller', { get: trapped, set: trapped })
		Object.defineProperty(Function.prototype, 'arguments', { get: trapped, set: trapped })
	} catch {
		// Non-configurable on this engine — nothing to do.
	}

	const freezeOwnFunctions = (obj: object): void => {
		for (const key of Object.getOwnPropertyNames(obj)) {
			const desc = Object.getOwnPropertyDescriptor(obj, key)
			if (desc !== undefined && 'value' in desc && typeof desc.value === 'function') {
				Object.defineProperty(obj, key, { ...desc, writable: false })
			}
		}
		Object.freeze(obj)
	}

	freezeOwnFunctions(Math)
	freezeOwnFunctions(JSON)
	freezeOwnFunctions(Reflect)

	// Error.prototype and friends are intentionally NOT frozen: error subclass
	// constructors legitimately assign own properties (e.g. PlayerError sets
	// this.name), and freezing them breaks the game's own error reporting.
	const protos = [
		Object.prototype, Function.prototype, Array.prototype,
		Map.prototype, Set.prototype, WeakMap.prototype, WeakSet.prototype,
		Promise.prototype, RegExp.prototype, String.prototype,
		Number.prototype, Boolean.prototype, Symbol.prototype
	]
	for (const proto of protos) {
		Object.freeze(proto)
	}

	globalThis.__hardenGlobals = function () {
		for (const name of ['console', 'performance']) {
			if (name in globalThis) {
				try {
					Object.defineProperty(globalThis, name, { configurable: false, writable: false })
				} catch {
					// Already sealed.
				}
			}
		}
		Object.freeze(globalThis)
	}
})()
