// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { expect } from 'chai'
import { describe, it } from 'mocha'

// Own modules
import { bundleFiles } from '../../../app/services/gamerunner/bundler.js'
import sourceFiles from '../../../app/utils/getSourceFile.js'

// Environment variables

// Config variables

// Destructuring and global variables
const {
	evaluatingGameRunner,
	tournamentGameRunner,
	commonTypes,
	errors,
	meyer,
	strategies
} = sourceFiles

// Setup test environment
import '../../testSetup.js'

describe('gameBundler', function () {
	interface FileMap {
		'main.ts': string;
		[key: string]: string;
	}

	let gameFiles: FileMap
	let strategyFiles: FileMap
	let tournamentGameRunnerFiles: FileMap
	let evaluatingGameRunnerFiles: FileMap


	beforeEach(function () {
		gameFiles = {
			...meyer.main,
			...meyer.gameState,
			...meyer.strategyAPI,
			...meyer.types,
			...meyer.utils,
			...commonTypes,
			...errors
		}

		strategyFiles = {
			...strategies.dumbStrategy,
			...commonTypes,
		}

		tournamentGameRunnerFiles = {
			...tournamentGameRunner,
			...commonTypes,
			...errors,
		}

		evaluatingGameRunnerFiles = {
			...evaluatingGameRunner,
			...commonTypes,
			...errors,
		}
	})

	it('should bundle the game files', async function () {
		const bundledCode = await bundleFiles(gameFiles, 'Game')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the strategy files', async function () {
		const bundledCode = await bundleFiles(strategyFiles, 'Strategy')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the tournament game runner files', async function () {
		const bundledCode = await bundleFiles(tournamentGameRunnerFiles, 'TournamentGameRunner')
		expect(bundledCode).to.be.a('string')
	})

	it('should bundle the evaluating game runner files', async function () {
		const bundledCode = await bundleFiles(evaluatingGameRunnerFiles, 'EvaluatingGameRunner')
		expect(bundledCode).to.be.a('string')
	})

	it('should allow the game to be instantiated', async function () {
		const bundledCode = await bundleFiles(gameFiles, 'Game')
		const GameClass = new Function(`
			${bundledCode}
			return Game.default;  // Game is the global name we set in esbuild
		`)()
		expect(GameClass).to.not.be.undefined

		const game = new GameClass()
		expect(game).to.not.be.undefined

		const result = game.init([])
		expect(result).to.not.be.undefined
	})
})
