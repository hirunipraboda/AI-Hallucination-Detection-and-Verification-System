const express = require('express');
const router = express.Router();
const {
  createAnalysis,
  getAllAnalyses,
  getAnalysisById,
  updateAnalysis,
  deleteAnalysis,
} = require('../controllers/analysisController');

router.post('/analyze', createAnalysis);
router.post('/', createAnalysis);
router.get('/', getAllAnalyses);
router.get('/:id', getAnalysisById);
router.put('/:id', updateAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;