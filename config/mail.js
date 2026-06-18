const nodemailer = require('nodemailer');

let transporter;
let isMailConfigured = false;

if (
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  isMailConfigured = true;
  console.log('Nodemailer SMTP transporter configured.');
} else {
  console.log('Console logging email fallback configured (SMTP env keys missing).');
}

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.SMTP_USER || '"Sunny Portfolio" <no-reply@sunnyranjan.com>',
    to: options.to || process.env.CONTACT_RECEIVER_EMAIL,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (isMailConfigured && transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      // Fall back to console log if SMTP fails at runtime
      logEmailToConsole(mailOptions);
    }
  } else {
    logEmailToConsole(mailOptions);
  }
};

function logEmailToConsole(mailOptions) {
  console.log('==================================================');
  console.log('📧 NODEMAILER CONSOLE NOTIFICATION');
  console.log(`TO:      ${mailOptions.to}`);
  console.log(`SUBJECT: ${mailOptions.subject}`);
  console.log('--------------------------------------------------');
  console.log(mailOptions.text || mailOptions.html);
  console.log('==================================================');
}

module.exports = {
  sendEmail,
  isMailConfigured,
};
