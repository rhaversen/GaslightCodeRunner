import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Theft attempt #3: prototype pollution — corrupt the shared Map prototype so
// every score read from the runner's Maps flows through OUR getter, then leak
// whatever we collect through an exception message.
const main = (api: MeyerStrategyAPI) => {
	let intercepted = ''

	try {
		const mapProto = Map.prototype as unknown as Record<string, unknown>
		const origGet = mapProto.get as ((k: unknown) => unknown) | undefined
		if (origGet !== undefined) {
			// Attempt to override — should fail on a frozen prototype.
			mapProto.get = function (this: Map<unknown, unknown>, k: unknown) {
				intercepted += `${String(k)}=${String(this.get(k))};`
				return origGet.call(this, k)
			}
		}
	} catch (e) {
		// Expected: prototype is frozen. The failure itself proves hardening.
	}

	if (intercepted.length > 0) {
		throw new Error(`POLLUTE:${intercepted}`)
	}

	// Play normally
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
