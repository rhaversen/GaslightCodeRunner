/* eslint-disable local/enforce-comment-order */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Game runners
const EvaluatingGameRunnerSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/EvaluatingGameRunner.ts'), 'utf-8')
const TournamentGameRunnerSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/TournamentGameRunner.ts'), 'utf-8')
const GameRunnerTypesSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/types.d.ts'), 'utf-8')

// Misc
const commonTypesSource = readFileSync(resolve(__dirname, '../../../sourceFiles/commonTypes.d.ts'), 'utf-8')
const errorsSource = readFileSync(resolve(__dirname, '../../../sourceFiles/errors.ts'), 'utf-8')
const utilsSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/utils.ts'), 'utf-8')
const PlayerSelectorSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/PlayerSelector.ts'), 'utf-8')
const RunningAverageSource = readFileSync(resolve(__dirname, '../../../sourceFiles/gameRunners/RunningAverage.ts'), 'utf-8')

//Meyer game
const meyerGameStateSource = readFileSync(resolve(__dirname, '../../../sourceFiles/meyer/gameState.ts'), 'utf-8')
const meyerMainSource = readFileSync(resolve(__dirname, '../../../sourceFiles/meyer/main.ts'), 'utf-8')
const meyerStrategyAPISource = readFileSync(resolve(__dirname, '../../../sourceFiles/meyer/strategyAPI.ts'), 'utf-8')
const meyerTypesSource = readFileSync(resolve(__dirname, '../../../sourceFiles/meyer/types.ts'), 'utf-8')
const meyerUtilsSource = readFileSync(resolve(__dirname, '../../../sourceFiles/meyer/utils.ts'), 'utf-8')

//Strategies
const dumbStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/dumbStrategy.ts'), 'utf-8')
const honestStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/honestStrategy.ts'), 'utf-8')
const lyingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/lyingStrategy.ts'), 'utf-8')
const cheatingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/cheatingStrategy.ts'), 'utf-8')
const slowStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/slowStrategy.ts'), 'utf-8')
const revealingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/revealingStrategy.ts'), 'utf-8')
const detEllerDeroverStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/detEllerDeroverStrategy.ts'), 'utf-8')
const chatGptStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/chatGptStrategy.ts'), 'utf-8')
const errorThrowingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/errorThrowingStrategy.ts'), 'utf-8')
const slowLoadingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/slowLoadingStrategy.ts'), 'utf-8')
const nonHaltingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/nonHaltingStrategy.ts'), 'utf-8')
const nonHaltingLoadingStrategySource = readFileSync(resolve(__dirname, '../../../sourceFiles/strategies/nonHaltingLoadingStrategy.ts'), 'utf-8')

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
