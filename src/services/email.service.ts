import "dotenv/config";
import nodemailer from "nodemailer";

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

interface Send {
  email: string;
  subject: string;
  html: string;
}

function send({ email, subject, html }: Send) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email: string, token: string) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a target="_blank" href="${href}">${href}</a>
  `;

  return send({ email, html, subject: "Activate" });
}

function passwordReset(email: string, passwordResetToken: string) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${passwordResetToken}`;

  const html = `
  <h1>Password reset</h1>
  <a target="_blank" href="${href}">${href}</a>
  `;

  return send({ email, html, subject: "Password reset" });
}

function changeEmail(email: string, newEmail: string) {
  const html = `
  <h1>Change email</h1>
  <p>
    Ви успішно змінили свою електронну адресу.
    Перевірте свою нову електронну пошту ${newEmail} для підтвердження зміни.
  </p>
  `;

  return send({ email, html, subject: "Change email" });
}

const emailService = {
  sendActivationEmail,
  send,
  passwordReset,
  changeEmail,
};

export default emailService;
