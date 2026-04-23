const crypto = require('crypto');
const Invite = require('../models/Invite');
const User = require('../models/User');
const { sendInviteEmail } = require('../utils/sendEmail');

// -------------------------------------------------------
// POST /api/invites
// Admin sends an invite to an email address
// -------------------------------------------------------
const sendInvite = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }

        const existingInvite = await Invite.findOne({
            email,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (existingInvite) {
            return res.status(409).json({ message: 'An active invite for this email already exists' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const invite = await Invite.create({
            email,
            name: name || '',
            token,
            expiresAt,
            invitedBy: req.user._id,
        });

        try {
            await sendInviteEmail(email, token);
        } catch (emailErr) {
            // Roll back invite if email fails so DB stays clean
            await Invite.findByIdAndDelete(invite._id);
            console.error('Email send error:', emailErr.message);
            return res.status(500).json({ message: 'Failed to send invite email. Please try again.' });
        }

        return res.status(201).json({ message: `Invite sent to ${email}` });
    } catch (err) {
        console.error('sendInvite error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// -------------------------------------------------------
// GET /api/invites/validate?token=xxx
// Public — called when invitee lands on /accept-invite
// -------------------------------------------------------
const validateInvite = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const invite = await Invite.findOne({ token });

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }
        if (invite.used) {
            return res.status(410).json({ message: 'This invite link has already been used' });
        }
        if (invite.expiresAt < new Date()) {
            return res.status(410).json({ message: 'This invite link has expired' });
        }

        return res.status(200).json({ email: invite.email });
    } catch (err) {
        console.error('validateInvite error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// -------------------------------------------------------
// POST /api/invites/accept
// Invitee submits password only to complete account setup
// -------------------------------------------------------
const acceptInvite = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const invite = await Invite.findOne({ token });

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }
        if (invite.used) {
            return res.status(410).json({ message: 'This invite link has already been used' });
        }
        if (invite.expiresAt < new Date()) {
            return res.status(410).json({ message: 'This invite link has expired' });
        }

        const existingUser = await User.findOne({ email: invite.email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account for this email already exists' });
        }

        // Create user with invite profile data; password hashed by User model pre-save hook
        const user = await User.create({
            name: (invite.name || '').trim(),
            email: invite.email,
            password,
            role: 'user',
            status: 'active',
        });

        // Mark invite as used
        invite.used = true;
        await invite.save();

        return res.status(201).json({
            message: 'Account activated successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        console.error('acceptInvite error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// -------------------------------------------------------
// GET /api/invites
// Admin — view all invites for user management table
// -------------------------------------------------------
const getInvites = async (req, res) => {
    try {
        const invites = await Invite.find()
            .sort({ createdAt: -1 })
            .populate('invitedBy', 'name email');
        return res.status(200).json(invites);
    } catch (err) {
        console.error('getInvites error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// -------------------------------------------------------
// DELETE /api/invites/:id
// Admin — revoke a pending invite
// -------------------------------------------------------
const revokeInvite = async (req, res) => {
    try {
        const invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }
        if (invite.used) {
            return res.status(400).json({ message: 'Cannot revoke an already accepted invite' });
        }

        await Invite.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Invite revoked' });
    } catch (err) {
        console.error('revokeInvite error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// -------------------------------------------------------
// POST /api/invites/:id/resend
// Admin resends invite to a pending or expired recipient
// -------------------------------------------------------
const resendInvite = async (req, res) => {
    try {
        const invite = await Invite.findById(req.params.id);

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }
        if (invite.used) {
            return res.status(400).json({ message: 'This invite has already been accepted' });
        }

        // Reset token and extend expiry by 48 hours
        invite.token = crypto.randomBytes(32).toString('hex');
        invite.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await invite.save();

        await sendInviteEmail(invite.email, invite.token);

        return res.status(200).json({ message: `Invite resent to ${invite.email}` });
    } catch (err) {
        console.error('resendInvite error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendInvite,
    validateInvite,
    acceptInvite,
    getInvites,
    revokeInvite,
    resendInvite,
};