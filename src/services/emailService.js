require("dotenv/config");
const nodemailer = require("nodemailer");
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const transporter = nodemailer.createTransport({
  service: "gmail",
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

const emailStyles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333333;
      text-align: center;
    }
    p {
      color: #666666;
      text-align: center;
      margin-bottom: 20px;
    }
    .button {
      display: block;
      width: fit-content;
      margin: 0 auto;
      padding: 10px 20px;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .footer {
      text-align: center;
      color: #999999;
      margin-top: 20px;
    }
  </style>
`;

function sendActivationEmail(email, token) {
  const href = `${CLIENT_ORIGIN}/activation/${token}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your HeyBoss Account</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <h1>Activate Your HeyBoss Account</h1>
        <p>Thank you for registering with HeyBoss! Please click the button below to activate your account:</p>
        <a class="button" href="${href}" target="_blank">Activate Account</a>
        <p class="footer">If you did not request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return send({ email, html, subject: "Activate Your HeyBoss Account" });
}

function passwordResetEmail(email, passwordResetToken) {
  const href = `${CLIENT_ORIGIN}/password-reset/${passwordResetToken}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your HeyBoss Password</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <h1>Reset Your HeyBoss Password</h1>
        <p>We received a request to reset your password. Click the button below to reset your password:</p>
        <a class="button" href="${href}" target="_blank">Reset Password</a>
        <p class="footer">If you did not request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return send({ email, html, subject: "Reset Your HeyBoss Password" });
}

function changeEmail(email, newEmail) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Change Your HeyBoss Email</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <h1>Change Your HeyBoss Email</h1>
        <p>You have successfully changed your email address. Please check your new email ${newEmail} for confirmation.</p>
        <p class="footer">If you did not request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return send({ email, html, subject: "Change Your HeyBoss Email" });
}

module.exports = {
  sendActivationEmail,
  send,
  passwordResetEmail,
  changeEmail
};
