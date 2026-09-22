import { MeyerStrategyAPI } from '../../meyer/types.ts'

// Theft attempt #4: tamper with the shared environment — replace Math.random
// to rig dice for ourselves, and freeze-bypass attempts on globalThis to
// replace the timing/log references the runner depends on.
const main = (api: MeyerStrategyAPI) => {
	const rigResults: string[] = []

	try {
		// Dice rigging: make every roll a Meyer (12 = 1000 points)
		(Math as unknown as Record<string, unknown>).random = () => 0.999999
		rigResults.push('Math.random replaced')
	} catch (e) {
		rigResults.push(`math: ${String(e)}`)
	}

	try {
		// Replace the timing function the runner uses to measure us
		(globalThis as unknown as Record<string, unknown>).strategyExecutionTimingFunction = undefined
		rigResults.push('timing fn removed')
	} catch (e) {
		rigResults.push(`timing: ${String(e)}`)
	}

	try {
		// Replace console to hide our traces (and intercept others' logs)
		(globalThis as unknown as Record<string, unknown>).console = { warn: () => {}, error: () => {}, info: () => {} }
		rigResults.push('console replaced')
	} catch (e) {
		rigResults.push(`console: ${String(e)}`)
	}

	// If ANY tampering succeeded, announce it (should never happen)
	if (rigResults.some(r => !r.includes(': '))) {
		throw new Error(`TAMPER:${rigResults.join('|')}`)
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
