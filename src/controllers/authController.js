const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");

const { User } = require("../models/user");
const { ApiError } = require("../exceptions/api.error");
const { ContractorDetails } = require("../models/contractorDetails");
const tokenServices = require("../services/tokenService");
const userServices = require("../services/userService");
const emailServices = require("../services/emailService");
const { jwtService } = require("../services/jwtService");

const generateTokens = async (res, user) => {
  try {
    const normalizeUser = userServices.normalize(user);
    const accessToken = jwtService.sign(normalizeUser);
    const refreshAccessToken = jwtService.signRefresh(normalizeUser);

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


const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password: pass, role, skills, experience, portfolio, } = req.body;

    const activationToken = uuid();

    userServices.validateEmail(email);
    userServices.validatePassword(pass);

    const existUser = await userServices.findByEmail(email);

    if (existUser) {
      throw ApiError.badRequest("User Already exist");
    }

    const password = await bcrypt.hash(pass, 10);

    const newUser = await User.create({
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

      await ContractorDetails.create(newContactor);
    }
    res.send(newUser);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const activate = async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      throw ApiError.notFound(`No user found`);
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

    if (!password || !email) {
      throw ApiError.badRequest("Incorrect data");
    }

    const user = await userServices.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest("No such user");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest("Wrong password");
    }

    if (user.activationToken) {
      throw ApiError.forbidden("Confirm your email");
    }

    let tokens = await generateTokens(res, user);

    if (!tokens) {
      throw ApiError.unauthorized("Unauthorized");
    }


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

    const userData = await jwtService.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiError.unauthorized();
    }

    await tokenServices.remove(userData.id);

    res.sendStatus(204);
  } catch (error) {
    console.log("err", error.message);
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.unauthorized("No refresh token provided");
    }

    const userData = await jwtService.verifyRefresh(refreshToken);

    if (!userData) {
      res.clearCookie("refreshToken")
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const token = await tokenServices.getByToken(refreshToken);

    if (!token) {
      res.clearCookie("refreshToken");
      throw ApiError.unauthorized("Refresh token not found");
    }

    const user = await userServices.findByEmail(userData.email);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const send = await generateTokens(res, user);

    return res.status(200).json(send);
  } catch (error) {
    console.error("Error during refresh token process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest(`Email is required`);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.notFound(`User not found`);
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

  if (!password || !confirmation) {
    throw ApiError.badRequest("Password is required");
  }

  if (password !== confirmation) {
    throw ApiError.badRequest(`Passwords do not match.`);
  }

  userServices.validatePassword(password)

  const user = await User.findOne({ where: { passwordResetToken } });

  if (!user) {
    throw ApiError.badRequest(`Invalid or expired password reset token`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null;
  await user.save();

  res.send("Password has been reset successfully");
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  passwordReset
}

module.exports = authController
