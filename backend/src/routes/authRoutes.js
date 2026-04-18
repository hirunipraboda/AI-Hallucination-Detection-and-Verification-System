const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);
router.get('/users', protect, getAllUsers);

module.exports = router;

