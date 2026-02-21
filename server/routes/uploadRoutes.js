const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Image upload route - requires authentication
router.post('/', authMiddleware, upload.single('image'), uploadImage);

module.exports = router;
