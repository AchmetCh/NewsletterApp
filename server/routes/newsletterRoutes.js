const express = require('express');
const router = express.Router();
const {
  getNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  duplicateNewsletter
} = require('../controllers/newsletterController');
const authMiddleware = require('../middlewares/authMiddleware');

// All newsletter routes require authentication
router.use(authMiddleware);

router.get('/', getNewsletters);
router.get('/:id', getNewsletterById);
router.post('/', createNewsletter);
router.put('/:id', updateNewsletter);
router.delete('/:id', deleteNewsletter);
router.post('/:id/duplicate', duplicateNewsletter);

module.exports = router;
