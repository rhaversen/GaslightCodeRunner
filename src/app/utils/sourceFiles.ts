/* eslint-disable local/enforce-comment-order */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { NODE_ENV } = process.env as Record<string, string>

// Base path for source files
const sourceFilesPath = (NODE_ENV === 'production' || NODE_ENV === 'staging')
	? resolve('/app/sourceFiles')
	: resolve(__dirname, '../../../sourceFiles')

// Game runners
const EvaluatingGameRunnerSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/EvaluatingGameRunner.ts'), 'utf-8')
const TournamentGameRunnerSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/TournamentGameRunner.ts'), 'utf-8')
const GameRunnerTypesSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/types.d.ts'), 'utf-8')

// Misc
const commonTypesSource = readFileSync(resolve(sourceFilesPath, 'commonTypes.d.ts'), 'utf-8')
const errorsSource = readFileSync(resolve(sourceFilesPath, 'errors.ts'), 'utf-8')
const utilsSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/utils.ts'), 'utf-8')
const PlayerSelectorSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/PlayerSelector.ts'), 'utf-8')
const RunningAverageSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/RunningAverage.ts'), 'utf-8')

//Meyer game
const meyerGameStateSource = readFileSync(resolve(sourceFilesPath, 'meyer/gameState.ts'), 'utf-8')
const meyerMainSource = readFileSync(resolve(sourceFilesPath, 'meyer/main.ts'), 'utf-8')
const meyerStrategyAPISource = readFileSync(resolve(sourceFilesPath, 'meyer/strategyAPI.ts'), 'utf-8')
const meyerTypesSource = readFileSync(resolve(sourceFilesPath, 'meyer/types.ts'), 'utf-8')
const meyerUtilsSource = readFileSync(resolve(sourceFilesPath, 'meyer/utils.ts'), 'utf-8')

//Strategies
const dumbStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/dumbStrategy.ts'), 'utf-8')
const honestStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/honestStrategy.ts'), 'utf-8')
const lyingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/lyingStrategy.ts'), 'utf-8')
const cheatingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/cheatingStrategy.ts'), 'utf-8')
const slowStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/slowStrategy.ts'), 'utf-8')
const revealingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/revealingStrategy.ts'), 'utf-8')
const detEllerDeroverStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/detEllerDeroverStrategy.ts'), 'utf-8')
const chatGptStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/chatGptStrategy.ts'), 'utf-8')
const errorThrowingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/errorThrowingStrategy.ts'), 'utf-8')
const slowLoadingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/slowLoadingStrategy.ts'), 'utf-8')
const nonHaltingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/nonHaltingStrategy.ts'), 'utf-8')
const nonHaltingLoadingStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/nonHaltingLoadingStrategy.ts'), 'utf-8')

// Security test strategies
const exitStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/exitStrategy.ts'), 'utf-8')
const requireStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/requireStrategy.ts'), 'utf-8')
const fsAccessStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/fsAccessStrategy.ts'), 'utf-8')
const networkAccessStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/networkAccessStrategy.ts'), 'utf-8')
const evalStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/evalStrategy.ts'), 'utf-8')
const functionConstructorStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/functionConstructorStrategy.ts'), 'utf-8')
const timerHijackStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/timerHijackStrategy.ts'), 'utf-8')
const globalModificationStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/globalModificationStrategy.ts'), 'utf-8')
const largeStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/largeStrategy.ts'), 'utf-8')
const memoryHogStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/memoryHogStrategy.ts'), 'utf-8')
const emptyStrategySource = readFileSync(resolve(sourceFilesPath, 'strategies/security/emptyStrategy.ts'), 'utf-8')

const sourceFiles = {
	commonTypes: { 'commonTypes.ts': commonTypesSource },
	gameRunners: {
		evaluatingGameRunner: { 'main.ts': EvaluatingGameRunnerSource },
		tournamentGameRunner: { 'main.ts': TournamentGameRunnerSource },
		utils: { 'utils.ts': utilsSource },
		PlayerSelector: { 'PlayerSelector.ts': PlayerSelectorSource },
		types: { 'types.d.ts': GameRunnerTypesSource },
		RunningAverage: { 'RunningAverage.ts': RunningAverageSource },
	},
	errors: { 'errors.ts': errorsSource },
	meyer: {
		gameState: { 'gameState.ts': meyerGameStateSource },
		main: { 'main.ts': meyerMainSource },
		strategyAPI: { 'strategyAPI.ts': meyerStrategyAPISource },
		types: { 'types.ts': meyerTypesSource },
		utils: { 'utils.ts': meyerUtilsSource },
	},
	strategies: {
		dumbStrategy: { 'main.ts': dumbStrategySource },
		honestStrategy: { 'main.ts': honestStrategySource },
		lyingStrategy: { 'main.ts': lyingStrategySource },
		cheatingStrategy: { 'main.ts': cheatingStrategySource },
		slowStrategy: { 'main.ts': slowStrategySource },
		revealingStrategy: { 'main.ts': revealingStrategySource },
		detEllerDeroverStrategy: { 'main.ts': detEllerDeroverStrategySource },
		chatGptStrategy: { 'main.ts': chatGptStrategySource },
		errorThrowingStrategy: { 'main.ts': errorThrowingStrategySource },
		slowLoadingStrategy: { 'main.ts': slowLoadingStrategySource },
		nonHaltingStrategy: { 'main.ts': nonHaltingStrategySource },
		nonHaltingLoadingStrategy: { 'main.ts': nonHaltingLoadingStrategySource },
		processExitStrategy: { 'main.ts': exitStrategySource },
		requireStrategy: { 'main.ts': requireStrategySource },
		fsAccessStrategy: { 'main.ts': fsAccessStrategySource },
		networkAccessStrategy: { 'main.ts': networkAccessStrategySource },
		evalStrategy: { 'main.ts': evalStrategySource },
		functionConstructorStrategy: { 'main.ts': functionConstructorStrategySource },
		timerHijackStrategy: { 'main.ts': timerHijackStrategySource },
		globalModificationStrategy: { 'main.ts': globalModificationStrategySource },
		largeStrategy: { 'main.ts': largeStrategySource },
		memoryHogStrategy: { 'main.ts': memoryHogStrategySource },
		emptyStrategy: { 'main.ts': emptyStrategySource },
	}
}

export const gameFiles = {
	...sourceFiles.meyer.main,
	...sourceFiles.meyer.gameState,
	...sourceFiles.meyer.strategyAPI,
	...sourceFiles.meyer.types,
	...sourceFiles.meyer.utils,
	...sourceFiles.commonTypes,
	...sourceFiles.errors
}

export const dumbStrategyFiles = {
	submissionId: 'dumb',
	files: {
		...sourceFiles.strategies.dumbStrategy,
	}
}

export const honestStrategyFiles = {
	submissionId: 'honest',
	files: {
		...sourceFiles.strategies.honestStrategy,
	}
}

export const lyingStrategyFiles = {
	submissionId: 'lying',
	files: {
		...sourceFiles.strategies.lyingStrategy,
	}
}

export const cheatingStrategyFiles = {
	submissionId: 'cheating',
	files: {
		...sourceFiles.strategies.cheatingStrategy,
	}
}

export const slowStrategyFiles = {
	submissionId: 'slow',
	files: {
		...sourceFiles.strategies.slowStrategy,
	}
}

export const revealingStrategyFiles = {
	submissionId: 'revealing',
	files: {
		...sourceFiles.strategies.revealingStrategy,
	}
}

export const detEllerDeroverStrategyFiles = {
	submissionId: 'detEllerDerover',
	files: {
		...sourceFiles.strategies.detEllerDeroverStrategy,
	}
}

export const chatGptStrategyFiles = {
	submissionId: 'chatGpt',
	files: {
		...sourceFiles.strategies.chatGptStrategy,
	}
}

export const errorThrowingStrategyFiles = {
	submissionId: 'errorThrowing',
	files: {
		...sourceFiles.strategies.errorThrowingStrategy,
	}
}

export const slowLoadingStrategyFiles = {
	submissionId: 'slowLoading',
	files: {
		...sourceFiles.strategies.slowLoadingStrategy,
	}
}

export const nonHaltingStrategyFiles = {
	submissionId: 'nonHalting',
	files: {
		...sourceFiles.strategies.nonHaltingStrategy,
	}
}

export const nonHaltingLoadingStrategyFiles = {
	submissionId: 'nonHaltingLoading',
	files: {
		...sourceFiles.strategies.nonHaltingLoadingStrategy,
	}
}

// Security test strategies
export const processExitStrategyFiles = {
	submissionId: 'processExit',
	files: { ...sourceFiles.strategies.processExitStrategy }
}

export const requireStrategyFiles = {
	submissionId: 'require',
	files: { ...sourceFiles.strategies.requireStrategy }
}

export const networkAccessStrategyFiles = {
	submissionId: 'networkAccess',
	files: { ...sourceFiles.strategies.networkAccessStrategy }
}

export const evalStrategyFiles = {
	submissionId: 'eval',
	files: { ...sourceFiles.strategies.evalStrategy }
}

export const functionConstructorStrategyFiles = {
	submissionId: 'functionConstructor',
	files: { ...sourceFiles.strategies.functionConstructorStrategy }
}

export const timerHijackStrategyFiles = {
	submissionId: 'timerHijack',
	files: { ...sourceFiles.strategies.timerHijackStrategy }
}

export const globalModificationStrategyFiles = {
	submissionId: 'globalModification',
	files: { ...sourceFiles.strategies.globalModificationStrategy }
}

export const largeStrategyFiles = {
	submissionId: 'large',
	files: { ...sourceFiles.strategies.largeStrategy }
}

export const memoryHogStrategyFiles = {
	submissionId: 'memoryHog',
	files: { ...sourceFiles.strategies.memoryHogStrategy }
}

export const emptyStrategyFiles = {
	submissionId: 'empty',
	files: { ...sourceFiles.strategies.emptyStrategy }
}

export const tournamentGameRunnerFiles = {
	...sourceFiles.gameRunners.tournamentGameRunner,
	...sourceFiles.errors,
	...sourceFiles.gameRunners.types,
	...sourceFiles.gameRunners.utils,
	...sourceFiles.gameRunners.PlayerSelector,
	...sourceFiles.gameRunners.RunningAverage,
}

export const evaluatingGameRunnerFiles = {
	...sourceFiles.gameRunners.evaluatingGameRunner,
	...sourceFiles.errors,
	...sourceFiles.gameRunners.types,
	...sourceFiles.gameRunners.utils,
	...sourceFiles.gameRunners.PlayerSelector,
	...sourceFiles.gameRunners.RunningAverage,
}

export default sourceFiles
