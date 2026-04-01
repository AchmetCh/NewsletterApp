const express = require('express');
const router = express.Router();

const {
  sendInvite,
  validateInvite,
  acceptInvite,
  getInvites,
  revokeInvite,
} = require('../controllers/inviteController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public routes (no auth required — invitee is not logged in yet)
router.get('/validate', validateInvite);
router.post('/accept', acceptInvite);

// Admin-only routes
router.post('/', authMiddleware, roleMiddleware('admin'), sendInvite);
router.get('/', authMiddleware, roleMiddleware('admin'), getInvites);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), revokeInvite);

module.exports = router;