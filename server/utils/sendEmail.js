const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Sends an invite email to a new user.
 * @param {string} toEmail - Recipient email
 * @param {string} token   - Secure invite token
 */
const sendInviteEmail = async (toEmail, token) => {
    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

    const mailOptions = {
        from: `"KeelWorks Newsletter App" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: "You're invited to the KeelWorks Newsletter App",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">You've been invited</h2>
        <p>An admin has invited you to join the <strong>KeelWorks Newsletter App</strong>.</p>
        <p>Click the button below to set up your account. This link expires in <strong>48 hours</strong> and can only be used once.</p>
        <a href="${inviteUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background-color: #2563eb; color: #ffffff; text-decoration: none;
                  border-radius: 6px; font-weight: bold;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 13px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">
          If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendInviteEmail };