// Node.js built-in modules

// Third-party libraries
import { Router } from 'express'

// Own modules
import { authenticateMicroservice } from '../middleware/auth.js'
import { gradeSubmission } from '../controllers/submissionController.js'

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
 * @param {Object} req.body.submission - The submission ID.
 * @param {string} req.body.language - The programming language of the submission.
 * @returns {number} res.status - HTTP status code
 */
router.post('/grade-submission', gradeSubmission)

export default router
