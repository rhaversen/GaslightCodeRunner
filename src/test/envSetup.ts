// Test environment setup: imported for side effects, must be the first
// import in every test file so config/env-dependent modules see test values.

process.env.NODE_ENV = 'test'
process.env.MICROSERVICE_AUTHORIZATION = 'TEST_MICROSERVICE_AUTHORIZATION'
process.env.RUNNER_MODE = 'evaluation'
