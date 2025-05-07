const { Token } = require("../models/token.js");
const { User } = require("../models/user.js");
const { ContractorDetails } = require("../models/contractorDetails.js");
const { EmployerDetails } = require("../models/employerDetails")
const { ApiError } = require("../exceptions/api.error.js");
const { ReviewFromEmployer } = require("../models/reviewFromEmployer.js");
const { ReviewFromJobSeeker } = require("../models/reviewFromJobSeeker.js");
require('dotenv').config();

const getRating = async (id) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.badRequest("User not found");
  }

  if (user.role === "job_seeker") {
    const reviews = await ReviewFromEmployer.findAll({ where: { job_seeker_id: id } })

    const rating = await reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return rating;
  }

  if (user.role === "employer") {
    const reviews = await ReviewFromJobSeeker.findAll({ where: { employer_id: id } })

    const rating = await reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;


    return rating;
  }
}

async function getUser(id) {
  return User.findOne({ where: { id } });
}

function normalize({ id, email, first_name, last_name, role }) {
  return { id, email, first_name, last_name, role };
}

async function findByEmail(email) {
  return await User.findOne({ where: { email } });
}

const getUserToken = async (user_id) => {
  return Token.findOne({ where: { user_id } });
};

const findByIdDetail = async (user_id, role) => {
  if (role === "job_seeker") {
    const detail = await ContractorDetails.findOne({ where: { user_id } });

    if (!detail) {
      throw ApiError.badRequest("No job seeker details found");
    }

    return detail
  }

  const detail = await EmployerDetails.findOne({ where: { user_id } });


  if (!detail) {
    throw ApiError.badRequest("No employer details found");
  }
  return detail
};


function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw ApiError.badRequest(`Invalid email address.`);
  }
}

function validatePassword(password) {
  if (!(password.length >= 6)) {
    throw ApiError.badRequest(`Incorrect password.`);
  }
}

const mergeUserData = async (user, detail) => {
  return {
    user_id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,

    company_name: detail?.company_name || null,
    company_type: detail?.company_type || null,
    company_location: detail?.company_location || null,
    about: detail?.about || null,
    country: detail?.country || null,
    city: detail?.city || null,
    phone_number: detail?.phone_number || null,
    team_size: detail?.team_size || null,
    clients: detail?.clients || null,
    contact_info: detail?.contact_info || null,
    rating: detail?.rating || null,
    avatar: dataUrl(detail?.avatar) || null,
    rating: await getRating(user.id) || null,
  }
}


const getToken = async (req, res) => {
  const user = req.user;
  let tokens = await authController.generateTokens(res, req.user);

  if (!tokens) throw new ApiError(401, "Unauthorized");

  const redirectUrl = `${process.env.CLIENT_ORIGIN}/auth?firstName=${encodeURIComponent(user.first_name)}&lastName=${encodeURIComponent(user.last_name)}&accessToken=${encodeURIComponent(tokens.accessToken)}`;

  return res.redirect(redirectUrl);
};

const saveNewUser = (req, res) => {
  const email = req.user.email;
  const redirectUrl = `${process.env.CLIENT_ORIGIN}/register?email=${email}`;

  return res.redirect(redirectUrl);
}

function dataUrl(url) {
  return `${process.env.BACKEND_ORIGIN}${url}`
}


const userServices = {
  normalize,
  findByEmail,
  getUser,
  getUserToken,
  findByIdDetail,
  validateEmail,
  validatePassword,
  mergeUserData,
  saveNewUser,
  getToken,
  getRating,
  dataUrl,
}

module.exports = userServices;