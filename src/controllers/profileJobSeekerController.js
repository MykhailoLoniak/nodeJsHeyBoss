const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const userServices = require("../services/userService");
const { User } = require("../models/user");
const { ContractorDetails } = require("../models/contractorDetails");
const { ContractorReview } = require("../models/contractorReviews");

const putProfile = async (req, res) => {
  const { refresh_token } = req.cookies;

  if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

  let userData = await jwtService.verifyRefresh(refresh_token);

  if (!userData) {
    res.clearCookie("refresh_token");
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const { id } = req.params;

  if (userData.id !== +id) {
    throw ApiError.forbidden("You are not authorized to edit this profile");
  }

  const {
    first_name,
    last_name,
    email,
    position,
    company,
    location,
    city,
    phone_number,
    section_title,
    description,
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

  await User.update(
    {
      first_name,
      last_name,
      email,
      company,
      location,
      city,
      phone_number,
    }
  )

  await ContractorDetails.update({
    position,
    section_title,
    description,
  })

  const data = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    email: user.email,
    country: user.country,
    location: user.location,
    city: user.city,
    phone_number: user.phone_number,
    job_category: detail.job_category,
    work_experience: detail.work_experience,
    portfolio: detail.portfolio,
    section_title: detail.section_title,
    description: detail.description,
    position: detail.position,
  }

  return res.status(200).json(data)
}

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
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    email: user.email,
    country: user.country,
    location: user.location,
    city: user.city,
    phone_number: user.phone_number,
    job_category: detail.job_category,
    work_experience: detail.work_experience,
    portfolio: detail.portfolio,
    section_title: detail.section_title,
    description: detail.description,
    position: detail.position,
  }

  return res.status(200).json(data);
};

const filterJobs = async (req, res) => {
  const {
    role,
    country,
    location,
    city,
    job_category,

    work_experience,
    position,
  } = req.query;

  const whereUser = {};

  if (role) whereUser.role = role;
  if (country) whereUser.country = country;
  if (location) whereUser.location = location;
  if (city) whereUser.city = city;

  const whereDatail = {};

  if (job_category) whereDatail.job_category = job_category;
  if (work_experience) whereDatail.work_experience = work_experience;
  if (position) whereDatail.position = position;

  const users = await User.findAll({
    where: whereUser,
    include: {
      model: ContractorDetails,
      as: "contractorDetails",
      where: whereDatail,
    },
  });

  if (!users.length) {
    throw ApiError.notFound("No users found");
  }


  const data = users.map((user) => {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      email: user.email,
      country: user.country,
      location: user.location,
      city: user.city,
      phone_number: user.phone_number,
      job_category: user.contractorDetails?.job_category,
      work_experience: user.contractorDetails?.work_experience,
      portfolio: user.contractorDetails?.portfolio,
      section_title: user.contractorDetails?.section_title,
      description: user.contractorDetails?.description,
      position: user.contractorDetails?.position,
    };
  });

  return res.status(200).json(data);
}

const newComment = async (req, res) => {
  const { comment, rating, reviewer_id, employer_id } = req.body;

  if (!comment) {
    throw ApiError.badRequest("Comment is required");
  }

  const reviewer = await User.findOne({ where: { id: reviewer_id } });

  if (!reviewer) {
    throw ApiError.badRequest("Reviewer not found");
  }

  const employer = await User.findOne({ where: { id: employer_id } });

  if (!employer) {
    throw ApiError.badRequest("Employer not found");
  }

  if (reviewer.role !== "employer") {
    throw ApiError.forbidden("You are not authorized to leave a comment");
  }

  if (rating < 1 || rating > 5) {
    throw ApiError.badRequest("Rating must be between 1 and 5");
  }

  if (comment && typeof comment !== 'string') {
    throw ApiError.badRequest("Invalid comment");
  }

  if (job.user_id === reviewer_id) {
    throw ApiError.forbidden("You cannot review your own job");
  }

  const review = await ContractorReview.create({
    employer_id,
    reviewer_id,
    rating,
    comment,
  });

  return res.status(201).json(review);
}

const getComments = async (req, res) => {
  const { id } = req.params;

  const comment = await ContractorReview.findAll({ where: { employer_id: id } });

  return res.status(200).json(comment);
}

const uploadAvatar = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Файл не надано" });
  }

  const avatarUrl = `/uploads/avatars/${file.filename}`;

  ContractorDetails.update(
    { avatar: avatarUrl },
    { where: { user_id: id } }
  ).then(() => {
    res.status(200).json(
      {
        message: "Аватар успішно оновлено",
        avatarUrl: `${process.env.BACKEND_ORIGIN}/${avatarUrl}`
      });
  }).catch((error) => {
    res.status(500).json({ error: "Не вдалося оновити аватар" });
  })
};


const profileJobSeekerController = {
  putProfile,
  getProfile,
  filterJobs,
  newComment,
  getComments,
  uploadAvatar
};

module.exports = profileJobSeekerController;
