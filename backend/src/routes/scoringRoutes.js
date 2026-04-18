const express = require('express');
const router = express.Router();
const {
    createScoringRecord,
    getScoringByResponseId,
    recalculateScore,
    deleteScoringRecord
} = require('../controllers/scoringController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createScoringRecord);
router.get('/response/:responseId', protect, getScoringByResponseId);
router.put('/:id', protect, recalculateScore);
router.delete('/:id', protect, deleteScoringRecord);

module.exports = router;
