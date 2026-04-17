const express = require('express');
const {
  createScoringRecord,
  getScoringByResponseId,
  searchScoringRecords,
  recalculateScore,
  softDeleteScoringRecord,
} = require('../controllers/scoringController');

const router = express.Router();

router.post('/', createScoringRecord);
router.get('/', searchScoringRecords);
router.get('/:responseId', getScoringByResponseId);
router.put('/:id', recalculateScore);
router.delete('/:id', softDeleteScoringRecord);

module.exports = router;

