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
        console.log('1. sendInvite reached, body:', req.body);

        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        console.log('2. checking existing user');
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(409).json({ message: 'A user with this email already exists' });

        console.log('3. checking existing invite');
        const existingInvite = await Invite.findOne({ email: normalizedEmail, used: false, expiresAt: { $gt: new Date() } });
        if (existingInvite) return res.status(409).json({ message: 'An active invite for this email already exists' });

        console.log('4. creating invite');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        const invite = await Invite.create({ email: normalizedEmail, token, expiresAt, invitedBy: req.user._id });

        console.log('5. sending email');
        try {
            await sendInviteEmail(normalizedEmail, token);
        } catch (mailErr) {
            // Keep DB state consistent: no pending invite if the email never sent.
            await Invite.findByIdAndDelete(invite._id);
            console.error('sendInvite mail error:', mailErr);
            return res.status(502).json({
                message: 'Invite email could not be delivered. Check Gmail settings and recipient address.',
                error: process.env.NODE_ENV === 'development' ? mailErr.message : undefined,
            });
        }

        console.log('6. done');
        return res.status(201).json({ message: `Invite sent to ${normalizedEmail}` });
    } catch (err) {
        console.error('sendInvite caught error:', err);
        return res.status(500).json({
            message: 'Server error while creating invite',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
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
// Public — invitee submits profile to complete account setup
// -------------------------------------------------------
const acceptInvite = async (req, res) => {
    try {
        const { token, name, team, title, password } = req.body;

        if (!token || !name || !password) {
            return res.status(400).json({ message: 'Token, name, and password are required' });
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

        // Create the user — password hashed by User model pre-save hook
        const user = await User.create({
            email: invite.email,
            password,
            name,
            team: team || '',
            title: title || '',
            role: 'user',
        });

        // Mark invite as used
        invite.used = true;
        await invite.save();

        return res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
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

module.exports = {
    sendInvite,
    validateInvite,
    acceptInvite,
    getInvites,
    revokeInvite,
};