import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// The guard is exercised through the same bundling path production uses, and
// its assertions run inside the VM — isolated-vm References cannot be copied
// to the host, so the guard's functions must be driven where they live.
import { bundleFiles } from '../../../services/gamerunner/bundler.js'
import { commonGameFiles } from '../../../utils/sourceFiles.js'

// Setup test environment
import '../../envSetup.js'

// Assertion script executed inside the VM. Returns a results object the host
// asserts on — plain data crosses the boundary, functions do not.
const GUARD_ASSERTIONS = `
(() => {
	const results = { checks: [] }
	const record = (name, ok, detail) => { results.checks.push({ name, ok, detail }) }

	try {
		// 1. Correctly tagged api → strategy invoked, receives the same api.
		let received = null
		const api1 = tagApi({ roll: () => 12 }, 'player-1')
		callGuarded({ submissionId: 'player-1', strategy: (a) => { received = a } }, api1, 'player-1')
		record('correct tag invokes strategy with the tagged api', received === api1)
	} catch (err) {
		record('correct tag invokes strategy with the tagged api', false, String(err))
	}

	try {
		// 2. Stale/wrong-owner api → attributed PlayerError.
		const stale = tagApi({}, 'player-1')
		try {
			callGuarded({ submissionId: 'player-2', strategy: () => {} }, stale, 'player-2')
			record('wrong-owner api rejected', false, 'no error thrown')
		} catch (err) {
			record('wrong-owner api rejected', err.name === 'PlayerError' && err.submissionId === 'player-2', String(err))
		}
	} catch (err) {
		record('wrong-owner api rejected', false, String(err))
	}

	try {
		// 3. Untagged api → rejected; games cannot opt out by skipping the tag.
		try {
			callGuarded({ submissionId: 'player-1', strategy: () => {} }, {}, 'player-1')
			record('untagged api rejected', false, 'no error thrown')
		} catch (err) {
			record('untagged api rejected', err.name === 'PlayerError')
		}
	} catch (err) {
		record('untagged api rejected', false, String(err))
	}

	try {
		// 4. The tag is invisible to the strategy (non-enumerable) but still enforced.
		const api4 = tagApi({ roll: () => 12 }, 'player-1')
		const spread = { ...api4 }
		const invisible = !('__ownerId' in spread) && !Object.keys(api4).includes('__ownerId')
		let enforced = true
		try {
			callGuarded({ submissionId: 'player-1', strategy: () => {} }, api4, 'player-1')
		} catch {
			enforced = false
		}
		record('tag invisible to strategy but still enforced', invisible && enforced)
	} catch (err) {
		record('tag invisible to strategy but still enforced', false, String(err))
	}

	try {
		// 5. PlayerError thrown by the strategy propagates with message intact.
		const api5 = tagApi({}, 'player-1')
		try {
			callGuarded(
				{ submissionId: 'player-1', strategy: () => { throw new PlayerError('You cannot roll twice.', 'player-1') } },
				api5,
				'player-1'
			)
			record('strategy PlayerError propagates', false, 'no error thrown')
		} catch (err) {
			record('strategy PlayerError propagates', err.name === 'PlayerError' && err.message.includes('cannot roll twice'))
		}
	} catch (err) {
		record('strategy PlayerError propagates', false, String(err))
	}

	return JSON.stringify(results)
})()
`

describe('gameGuard — shared game/strategy invocation guard', () => {
	it('enforces api ownership, tag invisibility, and PlayerError pass-through (assertions run in-VM)', async () => {
		// main.ts is the required bundle entry point; the shim re-exports the
		// guard the way a game imports it.
		const files = {
			...commonGameFiles,
			'main.ts': 'export { tagApi, callGuarded, PlayerError } from \'./gameGuard.ts\''
		}
		const code = await bundleFiles(files, 'GameGuard')

		const { default: ivm } = await import('isolated-vm')
		const isolate = new ivm.Isolate({ memoryLimit: 128 })
		const context = await isolate.createContext()
		// Expose the bundled exports as bare globals for the assertion script —
		// the bundle keeps them on the GameGuard IIFE return value.
		const raw = await context.eval(`${code}\n;globalThis.tagApi = GameGuard.tagApi; globalThis.callGuarded = GameGuard.callGuarded; globalThis.PlayerError = GameGuard.PlayerError;\n${GUARD_ASSERTIONS}`)
		isolate.dispose()

		const { checks } = JSON.parse(raw as string) as { checks: Array<{ name: string, ok: boolean, detail?: string }> }
		assert.ok(checks.length >= 5, `expected at least 5 checks, got ${checks.length}`)
		for (const check of checks) {
			assert.ok(check.ok, `${check.name} failed${check.detail !== undefined ? `: ${check.detail}` : ''}`)
		}
	})
})
