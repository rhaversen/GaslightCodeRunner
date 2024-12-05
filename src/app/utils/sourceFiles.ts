/* eslint-disable local/enforce-comment-order */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read the contents of the source files
const EvaluatingGameRunnerSource = readFileSync(resolve(__dirname, '../../../sourceFiles/EvaluatingGameRunner.ts'), 'utf-8')
const TournamentGameRunnerSource = readFileSync(resolve(__dirname, '../../../sourceFiles/TournamentGameRunner.ts'), 'utf-8')
const commonTypesSource = readFileSync(resolve(__dirname, '../../../sourceFiles/commonTypes.d.ts'), 'utf-8')
const errorsSource = readFileSync(resolve(__dirname, '../../../sourceFiles/errors.ts'), 'utf-8')

//Meyer
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

const sourceFiles = {
	commonTypes: { 'commonTypes.ts': commonTypesSource },
	evaluatingGameRunner: { 'main.ts': EvaluatingGameRunnerSource },
	tournamentGameRunner: { 'main.ts': TournamentGameRunnerSource },
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
		cheatingStrategy: { 'main.ts': cheatingStrategySource }
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
	...sourceFiles.strategies.dumbStrategy,
	...sourceFiles.commonTypes,
	...sourceFiles.errors
}

export const honestStrategyFiles = {
	...sourceFiles.strategies.honestStrategy,
	...sourceFiles.meyer.types,
	...sourceFiles.commonTypes,
	...sourceFiles.errors
}

export const lyingStrategyFiles = {
	...sourceFiles.strategies.lyingStrategy,
	...sourceFiles.meyer.types,
	...sourceFiles.commonTypes,
	...sourceFiles.errors
}

export const cheatingStrategyFiles = {
	...sourceFiles.strategies.cheatingStrategy,
	...sourceFiles.meyer.types,
	...sourceFiles.commonTypes,
	...sourceFiles.errors
}

export const tournamentGameRunnerFiles = {
	...sourceFiles.tournamentGameRunner,
	...sourceFiles.commonTypes,
	...sourceFiles.errors,
}

export const evaluatingGameRunnerFiles = {
	...sourceFiles.evaluatingGameRunner,
	...sourceFiles.commonTypes,
	...sourceFiles.errors,
}

export default sourceFiles
