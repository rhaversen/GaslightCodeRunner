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
 * @route POST api/v1/microservices/evaluate-submission
 * @description EValuate a submission
 * @access Private (Microservice)
 * @param {string} req.header.authorization - The secret key for the microservice.
 * @param {Object} req.body.candidateSubmission - The submission to be evaluated.
 * @param {Object[]} req.body.otherSubmissions - The other submissions to be evaluated against.
 * @returns {Object} The result of the evaluation.
 */
router.post('/evaluate-submission',
	authenticateMicroservice,
	handleSubmissionEvaluation
)

export default router
