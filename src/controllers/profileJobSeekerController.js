const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const userServices = require("../services/userService");
const { User } = require("../models/user");
const { ContractorDetails } = require("../models/contractorDetails");
const { ContractorReview } = require("../models/contractorReviews");
const { Jobs } = require('../models/jobs');

const getAllProfile = async (req, res) => {
  try {
    // Знаходимо всіх користувачів з роллю 'job_seeker'
    const users = await User.findAll({ where: { role: 'job_seeker' } });

    // Отримуємо список user_id
    const userIds = users.map(user => user.id);

    // Знаходимо всі відповідні ContractorDetails
    const details = await ContractorDetails.findAll({
      where: { user_id: userIds }
    });

    // Створюємо мапу деталей для зручного доступу
    const detailsMap = new Map(details.map(detail => [detail.user_id, detail]));

    // Формуємо результат
    const result = users.map(user => {
      const detail = detailsMap.get(user.id);

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
        job_category: detail?.job_category || null,
        work_experience: detail?.work_experience || null,
        portfolio: detail?.portfolio || null,
        section_title: detail?.section_title || null,
        description: detail?.description || null,
        position: detail?.position || null,
        avatar: detail?.avatar || null,
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
    avatar: detail.avatar,
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


const deleteProfile = async (req, res) => {
  const { id } = req.params;
  const { refresh_token } = req.cookies;

  if (!id && refresh_token) throw ApiError.unauthorized("No refresh token provided");

  const user = jwtService.verifyRefresh(refresh_token);

  if (id !== user.id) throw ApiError.forbidden("You are not authorized to edit this profile");

  try {
    await user.destroy({ where: { id } })

    res.status(204).end();
  } catch (error) {
    console.error("Error dellete profile", error);
    res.status(500).json(error);
  }
}

const getJob = async (req, res) => {
  const jobs = await Jobs.findAll({ where: { status: 'public' } });

  const jobsArr = jobs.map(async (job) => {
    const user = await userServices.getUser(job.user_id);

    return {
      user_id: user.id,
      last_name: user.last_name,
      first_name: user.first_name,
      role: user.role,
      job_id: job.id,
      job_title: job.job_title,
      location: job.location,
      employment_type: job.employment_type,
      salary: job.salary,
      short_summary: job.short_summary,
      full_description: job.full_description,
      application_deadline: job.application_deadline,
      visibility: job.visibility,
      status: job.status,
      posted_at: job.posted_at,
    }
  });

  return res.status(200).json(jobsArr)
}

const filterJobs = async (req, res) => {
  const {
    job_title,
    employment_type,
    min_salary,
    max_salary,
    status,
    location,
    short_summary,
    full_description,
    application_deadline,
    visibility,
  } = req.query;

  const where = {};
  if (job_title) where.job_title = job_title;
  if (location) where.location = location;
  if (employment_type) where.employment_type = employment_type;
  if (status) where.status = status;
  if (short_summary) where.short_summary = short_summary;
  if (full_description) where.full_description = full_description;
  if (application_deadline) where.application_deadline = application_deadline;
  if (visibility) where.visibility = visibility;

  if (min_salary || max_salary) {
    where.salary = {};
    if (min_salary) where.salary[Op.gte] = +min_salary;
    if (max_salary) where.salary[Op.lte] = +max_salary;
  }

  try {
    const jobs = await Jobs.findAll({ where: where });

    if (!jobs.length) {
      throw ApiError.notFound("No users found");
    }

    return res.status(200).json(jobs);

  } catch (error) {
    console.error("Filter error", error);
    return res.status(500).json({ message: "Server error" });
  }
};


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

const profileJobSeekerController = {
  getAllProfile,
  putProfile,
  getProfile,
  deleteProfile,

  getJob,
  filterJobs,

  newComment,
}

module.exports = profileJobSeekerController;
