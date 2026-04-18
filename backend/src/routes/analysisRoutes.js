const express = require('express');
const router = express.Router();
const {
  createAnalysis,
  getAllAnalyses,
  getAnalysisById,
  updateAnalysis,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/analyze', createAnalysis);
router.post('/', createAnalysis);
router.get('/', getAllAnalyses);
router.get('/:id', getAnalysisById);
router.put('/:id', updateAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router;