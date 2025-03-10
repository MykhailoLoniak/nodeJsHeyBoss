const Tokens = require("../models/token");
const { User: UserModel } = require("../models/user");
const {
  ContractorDetails: Details,
} = require("../models/contractorDetails.js");

async function getUser(id: number) {
  return UserModel.findOne({ where: { id } });
}
interface NormalizeInput {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function normalize({ id, email, firstName, lastName, role }: NormalizeInput) {
  // Тепер id та email мають типи, помилки компіляції повинні зникнути
  return { id, email, firstName, lastName, role };
}

async function findByEmail(email: string) {
  try {
    return await UserModel.findOne({ where: { email } });
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Database error");
  }
}

const getUserToken = async (userId: number) => {
  return Token.findOne({ where: { userId } });
};

const findByIdDetail = async (userId: number) => {
  try {
    return await Details.findOne({ where: { userId } });
  } catch (error) {
    console.error("Error finding contractorDetail1 by userId:", error);
    throw new Error("Database error");
  }
};

exports.normalize = normalize;
exports.findByEmail = findByEmail;
exports.getUser = getUser;
exports.getUserToken = getUserToken;
exports.findByIdDetail = findByIdDetail;
