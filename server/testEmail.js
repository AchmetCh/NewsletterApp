// server/testEmail.js
require('dotenv').config({ path: __dirname + '/.env' });

const nodemailer = require('nodemailer');

console.log('MAILGUN_API_KEY', process.env.MAILGUN_API_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'Test email',
    text: 'If you see this, Nodemailer is working.',
}).then(() => {
    console.log('SUCCESS - email sent');
}).catch((err) => {
    console.log('FAILED -', err.message);
});