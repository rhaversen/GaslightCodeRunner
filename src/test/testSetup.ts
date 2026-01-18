// file deepcode ignore NoHardcodedPasswords/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore NoHardcodedCredentials/test: Hardcoded credentials are only used for testing purposes
// file deepcode ignore HardcodedNonCryptoSecret/test: Hardcoded credentials are only used for testing purposes

import { type Server } from 'http'

import * as Sentry from '@sentry/node'
import * as chai from 'chai'
import chaiHttp from 'chai-http'
import { after, afterEach, before, beforeEach } from 'mocha'
import { restore } from 'sinon'

process.env.NODE_ENV = 'test'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'
process.env.MICROSERVICE_AUTHORIZATION = 'TEST_MICROSERVICE_AUTHORIZATION'
process.env.RUNNER_MODE = 'evaluation'

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
	// Close the agent and wait for the callback using a Promise
	await new Promise<void>((resolve) => {
		chaiAppServer.close(() => {
			resolve()
		})
	})
})

after(async function () {
	this.timeout(20000)
	// Close the server
	app.server.close()
	// Disconnect from sentry
	await Sentry.close()
})

export function getChaiAppServer (): ChaiHttp.Agent {
	return chaiAppServer
}
