const express = require('express');
const router = express.Router();
const {
    getAllSources,
    getSourceById,
    createSource,
    updateSource,
    deleteSource,
    checkSourceCredibility
} = require('../controllers/sourceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllSources);
router.get('/check', protect, checkSourceCredibility);
router.get('/:id', protect, getSourceById);
router.post('/', protect, createSource);
router.put('/:id', protect, updateSource);
router.delete('/:id', protect, deleteSource);

module.exports = router;
