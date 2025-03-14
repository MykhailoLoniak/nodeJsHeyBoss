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

// function sendActivationEmail(email, token) {
//   const href = `${CLIENT_ORIGIN}/activation/${token}`;
//   const html = `
//   <h1>Activate account</h1>
//   <a target="_blank" href="${href}">${href}</a>
//   `;

//   return send({ email, html, subject: "Activate" });
// }

function sendActivationEmail(email, token) {
  const href = `${CLIENT_ORIGIN}/activation/${token}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your Account</title>
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
          display: inline-block;
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
    </head>
    <body>
      <div class="container">
        <h1>Activate Your Account</h1>
        <p>Thank you for registering! Please click the button below to activate your account:</p>
        <a class="button" href="${href}" target="_blank">Activate Account</a>
        <p class="footer">If you did not request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return send({ email, html, subject: "Activate Your Account" });
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