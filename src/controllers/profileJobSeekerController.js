const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const userServices = require("../services/userService");
const { User } = require("../models/user");
const { ContractorDetails } = require("../models/contractorDetails");

const getAllProfile = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'job_seeker' } });
    const userIds = users.map(user => user.id);

    const details = await ContractorDetails.findAll({
      where: { user_id: userIds }
    });

    const detailsMap = new Map(details.map(detail => [detail.user_id, detail]));

    const result = users.map(user => {
      const detail = detailsMap.get(user.id);

      return {
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email: user.email,

        job_category: detail?.job_category || null,
        work_experience: detail?.work_experience || null,
        portfolio: detail?.portfolio || null,
        section_title: detail?.section_title || null,
        description: detail?.description || null,
        country: detail?.country || null,
        location: detail?.location || null,
        city: detail?.city || null,
        phone_number: detail?.phone_number || null,
        avatar: detail?.avatar || null,
        contact_info: detail?.contact_info || null,

      };
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.role === "employer") {
    throw ApiError.forbidden("No job seeker details found");
  }

  const detail = await ContractorDetails.findOne({ where: { user_id: id } });

  if (!detail) {
    throw ApiError.forbidden("No job seeker details found");
  }

  const data = {
    user_id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    email: user.email,

    job_category: detail?.job_category || null,
    work_experience: detail?.work_experience || null,
    portfolio: detail?.portfolio || null,
    section_title: detail?.section_title || null,
    description: detail?.description || null,
    country: detail.country || null,
    location: detail.location || null,
    city: detail.city || null,
    phone_number: detail.phone_number,
    avatar: detail?.avatar || null,
    contact_info: detail?.contact_info || null,
  }

  return res.status(200).json(data);
};

const putProfile = async (req, res) => {
  const { refresh_token } = req.cookies;

  if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

  let userData = await jwtService.verifyRefresh(refresh_token);

  if (!userData) {
    res.clearCookie("refresh_token");
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const { id } = req.params;

  if (+userData.id !== +id) {
    throw ApiError.forbidden("You are not authorized to edit this profile");
  }

  const {
    first_name,
    last_name,
    email,
    job_category,
    work_experience,
    portfolio,
    section_title,
    description,
    country,
    location,
    city,
    phone_number,
    contact_info,
  } = req.body;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.role === "employer") {
    throw ApiError.forbidden("You are not authorized to edit this profile");
  }

  const detail = await ContractorDetails.findOne({ where: { user_id: id } });

  if (!detail) {
    throw ApiError.forbidden("No job seeker details found");
  }

  await user.update({
    first_name,
    last_name,
    email,
  })

  await detail.update({
    job_category,
    work_experience,
    portfolio,
    section_title,
    description,
    country,
    location,
    city,
    phone_number,
    contact_info,
  })

  const data = {
    user_id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    email: user.email,

    job_category: detail?.job_category || null,
    work_experience: detail?.work_experience || null,
    portfolio: detail?.portfolio || null,
    section_title: detail?.section_title || null,
    description: detail?.description || null,
    country: detail?.country || null,
    location: detail?.location || null,
    city: detail?.city || null,
    phone_number: detail?.phone_number || null,
    avatar: detail?.avatar || null,
    contact_info: detail?.contact_info || null,
  }

  return res.status(200).json(data)
}

const profileJobSeekerController = {
  getAllProfile,
  putProfile,
  getProfile,
}

module.exports = profileJobSeekerController;
