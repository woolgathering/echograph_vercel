const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendMail = (to, subject, text) => transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });

module.exports = { sendMail };
