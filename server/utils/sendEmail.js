const Mailgun = require("mailgun.js");
const FormData = require("form-data");

const sendInviteEmail = async (toEmail, token) => {
  const mg = new Mailgun(FormData).client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.eu.mailgun.net',
  });

  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

  await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `KeelWorks Newsletter App <${process.env.MAILGUN_FROM}>`,
    to: [toEmail],
    subject: "You're invited to the KeelWorks Newsletter App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">You've been invited</h2>
        <p>An admin has invited you to join the <strong>KeelWorks Newsletter App</strong>.</p>
        <p>Click the button below to set up your account. This link expires in <strong>48 hours</strong> and can only be used once.</p>
        <a href="${inviteUrl}"
           style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                  background-color: #00929C; color: #ffffff; text-decoration: none;
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
  });
};

module.exports = { sendInviteEmail };
