const express = require('express');
const router = express.Router();
const { login, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
