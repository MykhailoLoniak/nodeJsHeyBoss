require("dotenv/config");
const nodemailer = require("nodemailer");
// const PORT= process.env.PORT || 3005;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST,
  service: "gmail",
  // port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${CLIENT_ORIGIN}/login/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a target="_blank" href="${href}">${href}</a>
  `;

  return send({ email, html, subject: "Activate" });
}

function passwordResetEmail(email, passwordResetToken) {
  const href = `${CLIENT_ORIGIN}/password-reset/${passwordResetToken}`;

  const html = `
  <h1>Password reset</h1>
  <a target="_blank" href="${href}">${href}</a>
  `;

  return send({ email, html, subject: "Password reset" });
}

function changeEmail(email, newEmail) {
  const html = `
  <h1>Change email</h1>
  <p>
    Ви успішно змінили свою електронну адресу.
    Перевірте свою нову електронну пошту ${newEmail} для підтвердження зміни.
  </p>
  `;

  return send({ email, html, subject: "Change email" });
}

module.exports = {
  sendActivationEmail,
  send,
  passwordResetEmail,
  changeEmail
}