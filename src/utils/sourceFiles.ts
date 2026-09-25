import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { NODE_ENV } = process.env as Record<string, string>

// Base path for source files. Production reads only the runner harness from
// here; the game-authoring contract (commonTypes, errors, gameGuard) and all
// game content come from the gaslight-games submodule mounted at games/.
const sourceFilesPath = (NODE_ENV === 'production' || NODE_ENV === 'staging')
	? resolve('/app/sourceFiles')
	: resolve(__dirname, '../../sourceFiles')
const gamesSourcePath = (NODE_ENV === 'production' || NODE_ENV === 'staging')
	? resolve('/app/sourceFiles/games')
	: resolve(__dirname, '../../sourceFiles/games')

// Game runners
const EvaluatingGameRunnerSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/EvaluatingGameRunner.ts'), 'utf-8')
const TournamentGameRunnerSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/TournamentGameRunner.ts'), 'utf-8')
const GameRunnerTypesSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/types.d.ts'), 'utf-8')

// Game-authoring contract, from the gaslight-games submodule
const commonTypesSource = readFileSync(resolve(gamesSourcePath, 'commonTypes.d.ts'), 'utf-8')
const errorsSource = readFileSync(resolve(gamesSourcePath, 'errors.ts'), 'utf-8')
const gameGuardSource = readFileSync(resolve(gamesSourcePath, 'gameGuard.ts'), 'utf-8')
const utilsSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/utils.ts'), 'utf-8')
const PlayerSelectorSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/PlayerSelector.ts'), 'utf-8')
const RunningAverageSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/RunningAverage.ts'), 'utf-8')
const securityBootstrapSource = readFileSync(resolve(sourceFilesPath, 'gameRunners/securityBootstrap.ts'), 'utf-8')

const sourceFiles = {
	commonTypes: { 'commonTypes.ts': commonTypesSource },
	gameRunners: {
		evaluatingGameRunner: { 'main.ts': EvaluatingGameRunnerSource },
		tournamentGameRunner: { 'main.ts': TournamentGameRunnerSource },
		utils: { 'utils.ts': utilsSource },
		PlayerSelector: { 'PlayerSelector.ts': PlayerSelectorSource },
		types: { 'types.d.ts': GameRunnerTypesSource },
		RunningAverage: { 'RunningAverage.ts': RunningAverageSource },
		securityBootstrap: { 'securityBootstrap.ts': securityBootstrapSource }
	},
	errors: { 'errors.ts': errorsSource },
	gameGuard: { 'gameGuard.ts': gameGuardSource }
}

// Game-authoring contract merged into every game bundle. Read from the
// gaslight-games submodule; actual game files always come from the database.
export const commonGameFiles = {
	...sourceFiles.commonTypes,
	...sourceFiles.errors,
	...sourceFiles.gameGuard
}

export const tournamentGameRunnerFiles = {
	...sourceFiles.gameRunners.securityBootstrap,
	...sourceFiles.gameRunners.tournamentGameRunner,
	...sourceFiles.commonTypes,
	...sourceFiles.errors,
	...sourceFiles.gameRunners.types,
	...sourceFiles.gameRunners.utils,
	...sourceFiles.gameRunners.PlayerSelector,
	...sourceFiles.gameRunners.RunningAverage
}

export const evaluatingGameRunnerFiles = {
	...sourceFiles.gameRunners.securityBootstrap,
	...sourceFiles.gameRunners.evaluatingGameRunner,
	...sourceFiles.commonTypes,
	...sourceFiles.errors,
	...sourceFiles.gameRunners.types,
	...sourceFiles.gameRunners.utils,
	...sourceFiles.gameRunners.PlayerSelector,
	...sourceFiles.gameRunners.RunningAverage
}

export default sourceFiles
