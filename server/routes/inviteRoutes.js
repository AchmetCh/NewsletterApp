const express = require('express');
const router = express.Router();

const {
  sendInvite,
  validateInvite,
  acceptInvite,
  getInvites,
  revokeInvite,
  resendInvite,
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
router.post('/:id/resend', authMiddleware, roleMiddleware('admin'), resendInvite);

module.exports = router;