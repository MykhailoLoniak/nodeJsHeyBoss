const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');

const { ContractorDetails } = require("../models/contractorDetails");
const { EmployerDetails } = require("../models/employerDetails")
const { User } = require("../models/user");
const tokenServices = require("../services/tokenService");
const emailServices = require("../services/emailService");
const { jwtService } = require("../services/jwtService");
const { ApiError } = require("../exceptions/api.error");
const userServices = require("../services/userService");

const generateTokens = async (res, user) => {
  const normalizeUser = userServices.normalize(user);
  const accessToken = jwtService.sign(normalizeUser);
  const refreshAccessToken = jwtService.signRefresh(normalizeUser);

  await tokenServices.save(user.id, refreshAccessToken);


  if (res) {
    res.cookie("refresh_token", refreshAccessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      HttpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    });
  }

  const send = {
    user: normalizeUser,
    accessToken,
  };

  return send;
};

const register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password: pass,
    role,
    country,
    city,
    phone_number,
    job_category,
    work_experience,
    portfolio,
    company_name,
    company_type,
    company_location
  } = req.body;

  if (!first_name || !last_name || !email || !pass || !role) {
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
      company_location,
      company_name,
      company_type,
    }

    await EmployerDetails.create(newEmployer);
  }

  res.send(userServices.normalize(new_user));

};

const activate = async (req, res) => {
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
};

const login = async (req, res) => {
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

  const tokens = await generateTokens(res, user);

  if (!tokens) {
    throw ApiError.unauthorized("Unauthorized");
  }

  // if (user.role === "job_seeker") {
  //   const detail = await userServices.findByIdDetail(+user.id, user.role);

  //   tokens = {
  //     user: {
  //       ...tokens.user,
  //       job_category: detail.job_category,
  //       work_experience: detail.work_experience,
  //       portfolio: detail.portfolio,
  //     },
  //     accessToken: tokens.accessToken,
  //   };
  // }

  // if (user.role === "employer") {
  //   const detail = await userServices.findByIdDetail(+user.id, user.role);

  //   tokens = {
  //     user: {
  //       ...tokens.user,
  //       company_location: detail.company_location,
  //       company_name: detail.company_name,
  //       company_type: detail.company_type,
  //     },
  //     accessToken: tokens.accessToken,
  //   };
  // }

  return res.status(200).json(tokens);
};

const logout = async (req, res) => {
  const { refresh_token } = req.cookies;

  const userData = await jwtService.verifyRefresh(refresh_token);

c

  await tokenServices.remove(userData.id);

  res.sendStatus(204);
};

const refresh = async (req, res) => {
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

const getToken = async (req, res) => {
  const user = req.user;
  let tokens = await authController.generateTokens(res, req.user);
  if (!tokens) {
    throw new ApiError(401, "Unauthorized");
  }

  const redirectUrl = `${process.env.CLIENT_ORIGIN}/auth?firstName=${encodeURIComponent(user.first_name)}&lastName=${encodeURIComponent(user.last_name)}&accessToken=${encodeURIComponent(tokens.accessToken)}`;

  return res.redirect(redirectUrl);
};

const saveNewUser = (req, res) => {
  const email = req.user.email;
  const redirectUrl = `${process.env.CLIENT_ORIGIN}/register?email=${email}`;

  return res.redirect(redirectUrl);
}

const authController = {
  generateTokens,
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  passwordReset,
  getToken,
  saveNewUser,
}

module.exports = authController
