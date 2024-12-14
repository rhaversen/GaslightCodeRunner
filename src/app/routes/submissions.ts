// Node.js built-in modules

// Third-party libraries
import { Router } from 'express'

// Own modules
import { authenticateMicroservice } from '../middleware/auth.js'
import { handleSubmissionEvaluation } from '../controllers/submissionController.js'

// Environment variables

// Config variables

// Destructuring and global variables
const router = Router()

// Apply microservice authentication to all routes
router.use(authenticateMicroservice)

/**
 * @route POST api/v1/microservices/grade-submission
 * @description Grade a submission
 * @access Private (Microservice)
 * @param {string} req.header.authorization - The secret key for the microservice.
 * @param {Object} req.body.submissionCode - The submission code.
 * @param {string} req.body.submissionId - The submission ID.
 * @returns {Object} The result of the evaluation.
 */
router.post('/grade-submission', handleSubmissionEvaluation)

export default router
