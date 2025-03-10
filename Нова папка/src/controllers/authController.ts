const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { User: UserMode } = require("../models/user");
const { ApiError: ApiErrors } = require("../exeptions/api.error");
const tokenServices = require("../services/tokenService");
const userServices = require("../services/userService");
const emailServices = require("../services/emailService");
const { jwtService: jwtServices1 } = require("../services/jwtService");
const {
  ContractorDetails: ContractorDetail,
} = require("../models/ContractorDetails");

/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

function validatePassword(password: string) {
  return password.length >= 6;
}

const generateTokens = async (res, user) => {
  try {
    const normalizeUser = userServices.normalize(user);
    const accessToken = jwtServices1.sign(normalizeUser);
    const refreshAccessToken = jwtServices1.signRefresh(normalizeUser);

    await tokenServices.save(user.id, refreshAccessToken);

    console.log("tokenServices", tokenServices);

    res.cookie("refreshToken", refreshAccessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      HttpOnly: true,
      secure: process.env.NODE_ENV === "production", // використовується тільки по HTTPS у продакшені
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });

    const send = {
      user: normalizeUser,
      accessToken,
    };

    return send;
  } catch (error) {
    console.error("Помилка під час оновлення токена:", error);
    throw error;
  }
};

async function createContractor({
  userId,
  skills,
  experience,
  portfolio,
}: {
  userId: number;
  skills: string;
  experience: string;
  portfolio: string;
}) {
  await ContractorDetail.create({
    userId,
    skills,
    experience,
    portfolio,
  });

  console.log("Розробника створено!");
}

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password: pass,
      role,
      skills,
      experience,
      portfolio,
    } = req.body;

    const activationToken = uuid();

    const errors = {
      email: validateEmail(email),
      password: validatePassword(pass),
    };

    if (!errors.email) {
      throw ApiErrors.badRequest(
        `Invalid email address.
      Please enter a valid email address in the format "example@example.com".`,
        errors
      );
    }

    if (!errors.password) {
      throw ApiErrors.badRequest(
        `Incorrect password.
      The length of the fault must be at least 6 characters`,
        errors
      );
    }

    const existUser = await userServices.findByEmail(email);

    if (existUser) {
      throw ApiErrors.badRequest("User Already exist", {
        email: "User already exist",
      });
    }

    const password = await bcrypt.hash(pass, 10);

    const newUser = await UserMode.create({
      firstName,
      lastName,
      email,
      password: password,
      role,
      activationToken,
    });

    await emailServices.sendActivationEmail(email, activationToken);

    if (role === "contractor") {
      const newContactor = {
        userId: newUser.id,
        skills,
        experience,
        portfolio,
      };

      await createContractor(newContactor);
    }

    res.send(newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("error________________:", error.message);
    } else {
      console.log("Unknown error");
    }
  }
};

const activate = async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await UserMode.findOne({ where: { activationToken } });

    if (!user) {
      return res.sendStatus(404);
    }

    user.activationToken = null;
    await user.save();

    return res.send(userServices.normalize(user));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userServices.findByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "No such user" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    if (user.activationToken) {
      return res.status(403).json({ error: "Confirm your email" });
    }

    let tokens = await generateTokens(res, user);

    if (user.role === "contractor") {
      const detail = await userServices.findByIdDetail(+user.id);

      tokens = {
        user: {
          ...tokens.user,
          skills: detail.skills,
          experience: detail.experience,
          portfolio: detail.portfolio,
        },
        accessToken: tokens.accessToken,
      };
    }

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log("refreshToken...............................", refreshToken);
    const userData = await jwtServices1.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiErrors.unauthorized();
    }

    await tokenServices.remove(userData.id);

    res.sendStatus(204);
  } catch (error) {
    console.log("err", error.message);
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  console.log("Cookies:", req.cookies); // Перевірте, чи передаються cookies

  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.log("No refresh token provided");
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Перевірка refreshToken
    const userData = await jwtServices1.verifyRefresh(refreshToken);
    console.log("Verified user data from refresh token:", userData);

    if (!userData) {
      console.log("Invalid refresh token");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Отримуємо refreshToken з бази
    const token = await tokenServices.getByToken(refreshToken);
    console.log("Token from database:", token);

    if (!token) {
      console.log("Refresh token not found in database");
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Отримуємо користувача
    const user = await userServices.findByEmail(userData.email);
    console.log("User data:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Генеруємо нові токени
    const send = await generateTokens(res, user);
    console.log("Generated new tokens:", send);

    return res.status(200).json(send);
  } catch (error) {
    console.error("Error during refresh token process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    // return res.status(400).send("Email is required");
    throw ApiErrors.badRequest(`Email is required`);
  }

  const user = await UserMode.findOne({ where: { email } });

  if (!user) {
    // res.status(404).send("User not found");
    throw ApiErrors.notFound(`User not found`);
  }

  const passwordResetToken = uuid();

  user.passwordResetToken = passwordResetToken;
  await user.save();
  await emailServices.passwordResetEmail(email, passwordResetToken);

  res.send("Password reset link has been sent to your email");
};

const passwordReset = async (req, res) => {
  const { passwordResetToken } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiErrors.badRequest(
      `Passwords do not match.
      Please make sure both password fields are the same.`
    );
  }

  if (!validatePassword(password)) {
    throw ApiErrors.badRequest(
      `Incorrect password.
      The length of the fault must be at least 6 characters`
    );
  }

  const user = await UserMode.findOne({ where: { passwordResetToken } });

  if (!user) {
    // res.status(404).send("Invalid or expired password reset token");
    throw ApiErrors.badRequest(`Invalid or expired password reset token`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null;
  await user.save();

  res.send("Password has been reset successfully");
};

exports.register = register;
exports.activate = activate;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.requestPasswordReset = requestPasswordReset;
exports.passwordReset = passwordReset;
