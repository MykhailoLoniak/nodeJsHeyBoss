const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const userServices = require("../services/userService");
const { User } = require("../models/user");


const getProfile = async (req, res) => {
  const { refresh_token } = req.cookies;

  if (!refresh_token) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  let userData = await jwtService.verifyRefresh(refresh_token);

  if (!userData) {
    res.clearCookie("refresh_token");
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const detail = await userServices.findByIdDetail(+userData.id, userData.role);

  userData = {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    role: userData.role,
    ...detail,
  };

  return res.status(200).json(userData);
};

const getUserById = async (req, res, next) => {
  try {
    console.log(`-------------------------------------------`);
    const { id } = req.params;
    console.log(`User ID: ${id}`);

    if (!id) {
      throw ApiError.badRequest("User ID is required");
    }

    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const detail = await userServices.findByIdDetail(user.id, user.role);

    return res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      ...detail,
    });

  } catch (error) {
    console.error("💥 Error in getUserById:", error);
    next(error); // або res.status(500).json({ message: "Internal Server Error" });
  }
};


const getUsersByRole = async (role) => {
  const users = await User.findAll({
    where: { role },
  });

  if (!users || users.length === 0) {
    throw ApiError.badRequest(`No ${role}s found`);
  }

  return users.map(async (user) => {
    const detail = await userServices.findByIdDetail(user.id, user.role);

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      ...detail,
    };
  });
};



const getJobSeekers = async (req, res) => {
  const users = await getUsersByRole("job_seeker");

  return res.status(200).json(users);
};

const getEmployers = async (req, res) => {
  const users = await getUsersByRole("employer");

  return res.status(200).json(users);
};

const profileController = {
  getProfile,
  getUserById,
  getJobSeekers,
  getEmployers,
};

module.exports = profileController;
