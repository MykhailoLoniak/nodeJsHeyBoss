const { Token } = require("../models/token.js");
const { User } = require("../models/user.js");
const { ContractorDetails } = require("../models/contractorDetails.js");
const { ApiError } = require("../exceptions/api.error.js");


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

const findByIdDetail = async (user_id) => {
  return await ContractorDetails.findOne({ where: { user_id } });
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

const userService = {
  normalize,
  findByEmail,
  getUser,
  getUserToken,
  findByIdDetail,
  validateEmail,
  validatePassword,
}

module.exports = userService;