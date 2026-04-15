const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const explanationController = require('../controllers/explanationController');

// No authentication middleware

// Validation rules
const createExplanationValidation = [
  body('responseId').notEmpty().withMessage('Response ID is required'),
  body('originalText').notEmpty().withMessage('Original text is required'),
  body('claims').isArray().withMessage('Claims must be an array'),
  body('verificationResults').isArray().withMessage('Verification results must be an array'),
  body('scores').isObject().withMessage('Scores must be an object'),
  body('scores.confidence').isNumeric().withMessage('Confidence score must be a number'),
  body('scores.risk').isIn(['Low', 'Medium', 'High']).withMessage('Invalid risk level')
];

const responseIdValidation = [
  param('responseId').notEmpty().withMessage('Response ID is required')
];

const interactionValidation = [
  param('responseId').notEmpty().withMessage('Response ID is required'),
  body('action').isIn(['tap', 'expand', 'export', 'time']).withMessage('Invalid action')
];

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// CRUD Routes for Component 5
router.post('/explanations',
  createExplanationValidation,
  explanationController.createExplanation
);

router.post('/explanations/upload',
  upload.single('pdf'),
  explanationController.uploadPdf
);

const getExplanationsValidation = [
  // Optional but safe string checks and escaping to prevent NoSQL injection via regex
  query('search').optional().isString().trim().escape().withMessage('Search must be a string'),
  query('issueType').optional().isIn(['verified', 'contradicted', 'unverifiable', 'disputed']).withMessage('Invalid issue type'),
  query('risk').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid risk filter'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['asc', 'desc']).withMessage('Sort must be asc or desc')
];

router.get('/explanations',
  getExplanationsValidation,
  explanationController.getUserExplanations
);

router.get('/explanations/:responseId',
  responseIdValidation,
  explanationController.getExplanation
);

router.put('/explanations/:responseId',
  responseIdValidation,
  explanationController.updateExplanation
);

router.delete('/explanations/:responseId',
  responseIdValidation,
  explanationController.deleteExplanation
);

// Interaction tracking
router.post('/explanations/:responseId/interaction',
  interactionValidation,
  explanationController.trackInteraction
);

// Regenerate explanation
router.post('/explanations/:responseId/regenerate',
  responseIdValidation,
  explanationController.regenerateExplanation
);

// Export functionality
router.get('/explanations/:responseId/export',
  responseIdValidation,
  explanationController.exportExplanation
);

module.exports = router;