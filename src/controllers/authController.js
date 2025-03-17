const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');

const { User } = require("../models/user");
const { ApiError } = require("../exceptions/api.error");
const { ContractorDetails } = require("../models/contractorDetails");
const { EmployerDetails } = require("../models/employerDetails")
const tokenServices = require("../services/tokenService");
const userServices = require("../services/userService");
const emailServices = require("../services/emailService");
const { jwtService } = require("../services/jwtService");
const client = new OAuth2Client("621257397063-l7j8d01rlmjdt4odg9tt7vpftmffhgc4.apps.googleusercontent.com");

const generateTokens = async (res, user) => {
  try {
    const normalizeUser = userServices.normalize(user);
    const accessToken = jwtService.sign(normalizeUser);
    const refreshAccessToken = jwtService.signRefresh(normalizeUser);

    await tokenServices.save(user.id, refreshAccessToken);

    console.log("tokenServices", tokenServices);

    res.cookie("refresh_token", refreshAccessToken, {
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
    const { first_name, last_name, email, password: pass, role, country, city, phone_number, job_category, work_experience, portfolio, company_name, company_type } = req.body;

    if (!first_name && !last_name && !email && pass && role) {
      throw ApiError.badRequest("Not all data was transferred");
    }

    userServices.validateEmail(email);
    userServices.validatePassword(pass);

    const exist_user = await userServices.findByEmail(email);

    if (exist_user) {
      throw ApiError.badRequest("User Already exist");
    }

    const password = await bcrypt.hash(pass, 10);
    const activation_token = uuid();

    const new_user = await User.create({
      first_name,
      last_name,
      email,
      password: password,
      role,
      activation_token,
      country,
      city,
      phone_number,
    });

    await emailServices.sendActivationEmail(email, activation_token);

    if (role === "job_seeker") {
      const newContractor = {
        user_id: new_user.id,
        job_category,
        work_experience,
        portfolio,
      };

      await ContractorDetails.create(newContractor);
    }

    if (role === "employer") {
      const newEmployer = {
        user_id: new_user.id,
        company_name,
        company_type,
      }

      await EmployerDetails.create(newEmployer);
    }

    res.send(userServices.normalize(new_user));
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const activate = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw ApiError.badRequest("Token not passed");
    }

    const user = await User.findOne({ where: { activation_token: token } });

    if (!user) {
      throw ApiError.notFound(`No user found`);
    }

    user.activation_token = null;
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

    if (user.activation_token) {
      throw ApiError.forbidden("Confirm your email");
    }

    let tokens = await generateTokens(res, user);

    if (!tokens) {
      throw ApiError.unauthorized("Unauthorized");
    }

    if (user.role === "job_seeker") {
      const detail = await userServices.findByIdDetail(+user.id, user.role);

      tokens = {
        user: {
          ...tokens.user,
          job_category: detail.job_category,
          work_experience: detail.work_experience,
          portfolio: detail.portfolio,
        },
        accessToken: tokens.accessToken,
      };
    }

    if (user.role === "employer") {
      const detail = await userServices.findByIdDetail(+user.id, user.role);

      console.log('token____________________:', tokens);


      tokens = {
        user: {
          ...tokens.user,
          company_name: detail.company_name,
          company_type: detail.company_type,
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
    const { refresh_token } = req.cookies;

    const userData = await jwtService.verifyRefresh(refresh_token);

    if (!userData || !refresh_token) {
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
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      throw ApiError.unauthorized("No refresh token provided");
    }

    const userData = await jwtService.verifyRefresh(refresh_token);

    if (!userData) {
      res.clearCookie("refresh_token")
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const token = await tokenServices.getByToken(refresh_token);

    if (!token) {
      res.clearCookie("refresh_token");
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

  const password_reset_token = uuid();

  user.password_reset_token = password_reset_token;
  await user.save();
  await emailServices.passwordResetEmail(email, password_reset_token);

  res.send("Password reset link has been sent to your email");
};

const passwordReset = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw ApiError.badRequest("Password is required");
  }

  userServices.validatePassword(password)

  const user = await User.findOne({ where: { password_reset_token: token } });

  if (!user) {
    throw ApiError.badRequest(`Invalid or expired password reset token`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.password_reset_token = null;
  await user.save();

  res.send("Password has been reset successfully");
};

const GoogleOAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "621257397063-2i735m09hhehr4ilf4stk0el72ona13p.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    console.log("Google user:", { email, name, picture });

    // Перевіряємо, чи є такий юзер у базі
    let user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.badRequest("No such user");
    }

    if (user.activation_token) {
      throw ApiError.forbidden("Confirm your email");
    }

    let tokens = await generateTokens(res, user);

    if (!tokens) {
      throw ApiError.unauthorized("Unauthorized");
    }

    if (user.role === "job_seeker") {
      const detail = await userServices.findByIdDetail(+user.id, user.role);

      tokens = {
        user: {
          ...tokens.user,
          job_category: detail.job_category,
          work_experience: detail.work_experience,
          portfolio: detail.portfolio,
        },
        access_token: tokens.access_token,
      };
    }

    if (user.role === "employer") {
      const detail = await userServices.findByIdDetail(+user.id, user.role);

      tokens = {
        user: {
          ...tokens.user,
          company_name: detail.company_name,
          company_type: detail.company_type,
        },
        access_token: tokens.access_token,
      };
    }

    return res.status(200).json(tokens);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.status(401).json({ error: "Invalid Google token" });
  }
};

const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  passwordReset,
  GoogleOAuth
}

module.exports = authController
