/* eslint-disable local/enforce-comment-order */
// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

// Node.js built-in modules

// Third-party libraries
import { restore } from 'sinon'
import chaiHttp from 'chai-http'
import * as chai from 'chai'
import { type Server } from 'http'
import { before, beforeEach, afterEach, after } from 'mocha'
import * as Sentry from '@sentry/node'

// Own modules

// Test environment settings
process.env.NODE_ENV = 'test'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'

// Global variables
const chaiHttpObject = chai.use(chaiHttp)
let app: { server: Server }
let chaiAppServer: ChaiHttp.Agent

before(async function () {
	this.timeout(20000)
	// Setting environment
	process.env.NODE_ENV = 'test'

	// Importing and starting the app
	app = await import('../app/index.js')
})

beforeEach(async function () {
	chaiAppServer = chaiHttpObject.request(app.server).keepOpen()
})

afterEach(async function () {
	restore()
	chaiAppServer.close()
})

after(async function () {
	this.timeout(20000)
	// Close the server
	app.server.close()
	// Disconnect from sentry
	await Sentry.close()
})

export { chaiAppServer }
