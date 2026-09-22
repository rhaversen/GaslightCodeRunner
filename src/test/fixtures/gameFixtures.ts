// Test fixtures built from the canonical game source. This module exists so
// that production code never reads game content from disk: CodeRunnerService
// imports only commonGameFiles and the game-runner bundles, while everything
// under sourceFiles/meyer and sourceFiles/strategies is loaded exclusively
// here. Actual game content always arrives from the database.

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceFilesPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../sourceFiles')

function read (relativePath: string): string {
	return readFileSync(resolve(sourceFilesPath, relativePath), 'utf-8')
}

const commonTypesSource = read('commonTypes.d.ts')
const errorsSource = read('errors.ts')
const gameGuardSource = read('gameGuard.ts')

const meyerGameStateSource = read('meyer/gameState.ts')
const meyerMainSource = read('meyer/main.ts')
const meyerStrategyAPISource = read('meyer/strategyAPI.ts')
const meyerTypesSource = read('meyer/types.ts')
const meyerUtilsSource = read('meyer/utils.ts')

const strategyStealingGameSource = read('games/security/strategyStealingGame.ts')

function strategyFiles (name: string): { 'main.ts': string } {
	return { 'main.ts': read(`strategies/${name}.ts`) }
}

export const gameFiles = {
	'main.ts': meyerMainSource,
	'gameState.ts': meyerGameStateSource,
	'strategyAPI.ts': meyerStrategyAPISource,
	'types.ts': meyerTypesSource,
	'utils.ts': meyerUtilsSource,
	'commonTypes.ts': commonTypesSource,
	'errors.ts': errorsSource,
	'gameGuard.ts': gameGuardSource
}

export const commonGameFiles = {
	'commonTypes.ts': commonTypesSource,
	'errors.ts': errorsSource,
	'gameGuard.ts': gameGuardSource
}

export const dumbStrategyFiles = {
	submissionId: 'dumb',
	files: strategyFiles('dumbStrategy')
}

export const honestStrategyFiles = {
	submissionId: 'honest',
	files: strategyFiles('honestStrategy')
}

export const lyingStrategyFiles = {
	submissionId: 'lying',
	files: strategyFiles('lyingStrategy')
}

export const cheatingStrategyFiles = {
	submissionId: 'cheating',
	files: strategyFiles('cheatingStrategy')
}

export const slowStrategyFiles = {
	submissionId: 'slow',
	files: strategyFiles('slowStrategy')
}

export const revealingStrategyFiles = {
	submissionId: 'revealing',
	files: strategyFiles('revealingStrategy')
}

export const detEllerDeroverStrategyFiles = {
	submissionId: 'detEllerDerover',
	files: strategyFiles('detEllerDeroverStrategy')
}

export const chatGptStrategyFiles = {
	submissionId: 'chatGpt',
	files: strategyFiles('chatGptStrategy')
}

export const errorThrowingStrategyFiles = {
	submissionId: 'errorThrowing',
	files: strategyFiles('errorThrowingStrategy')
}

export const slowLoadingStrategyFiles = {
	submissionId: 'slowLoading',
	files: strategyFiles('slowLoadingStrategy')
}

export const nonHaltingStrategyFiles = {
	submissionId: 'nonHalting',
	files: strategyFiles('nonHaltingStrategy')
}

export const nonHaltingLoadingStrategyFiles = {
	submissionId: 'nonHaltingLoading',
	files: strategyFiles('nonHaltingLoadingStrategy')
}

// Security test strategies
export const processExitStrategyFiles = {
	submissionId: 'processExit',
	files: strategyFiles('security/exitStrategy')
}

export const requireStrategyFiles = {
	submissionId: 'require',
	files: strategyFiles('security/requireStrategy')
}

export const networkAccessStrategyFiles = {
	submissionId: 'networkAccess',
	files: strategyFiles('security/networkAccessStrategy')
}

export const evalStrategyFiles = {
	submissionId: 'eval',
	files: strategyFiles('security/evalStrategy')
}

export const functionConstructorStrategyFiles = {
	submissionId: 'functionConstructor',
	files: strategyFiles('security/functionConstructorStrategy')
}

export const timerHijackStrategyFiles = {
	submissionId: 'timerHijack',
	files: strategyFiles('security/timerHijackStrategy')
}

export const globalModificationStrategyFiles = {
	submissionId: 'globalModification',
	files: strategyFiles('security/globalModificationStrategy')
}

export const errorExfilStrategyFiles = {
	submissionId: 'errorExfil',
	files: strategyFiles('security/errorExfilStrategy')
}

export const globalScanStrategyFiles = {
	submissionId: 'globalScan',
	files: strategyFiles('security/globalScanStrategy')
}

export const prototypePolluteStrategyFiles = {
	submissionId: 'prototypePollute',
	files: strategyFiles('security/prototypePolluteStrategy')
}

export const envTamperStrategyFiles = {
	submissionId: 'envTamper',
	files: strategyFiles('security/envTamperStrategy')
}

export const staleApiStrategyFiles = {
	submissionId: 'staleApi',
	files: strategyFiles('security/staleApiStrategy')
}

export const secretiveStrategyFiles = {
	submissionId: 'secretive',
	files: strategyFiles('security/secretiveStrategy')
}

export const largeStrategyFiles = {
	submissionId: 'large',
	files: strategyFiles('security/largeStrategy')
}

export const memoryHogStrategyFiles = {
	submissionId: 'memoryHog',
	files: strategyFiles('security/memoryHogStrategy')
}

export const emptyStrategyFiles = {
	submissionId: 'empty',
	files: strategyFiles('security/emptyStrategy')
}

export const statisticsStrategyFiles = {
	submissionId: 'statistics',
	files: strategyFiles('statisticsStrategy')
}

export const exampleStrategyFiles = {
	submissionId: 'example',
	files: strategyFiles('exampleStrategy')
}

export const strategyStealingGameFiles = {
	'main.ts': strategyStealingGameSource,
	'commonTypes.ts': commonTypesSource,
	'errors.ts': errorsSource
}
