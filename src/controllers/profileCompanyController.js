const { Op } = require("sequelize");

const { User } = require("../models/user");
const { EmployerDetails } = require("../models/employerDetails");
const userServices = require("../services/userService");
const ApiError = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");


const getProfile = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.role === "job_seeker") {
    throw ApiError.forbidden("No employer details found");
  }

  const detail = await userServices.findByIdDetail(+user.id, user.role);

  const data = {
    user_id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    company_name: detail.company_name,
    company_type: detail.company_type,
    company_location: detail.company_location,
    contact_info: detail.contact_info,
    team_size: detail.team_size,
    clients: detail.clients,
  }

  return res.status(200).json(data);
};

const putProfile = async (req, res) => {
  const { id } = req.params;

  const { refresh_token } = req.cookies;

  const user = await jwtService.verifyRefresh(refresh_token);

  if (!user || !refresh_token) {
    throw ApiError.unauthorized();
  }

  if (user.id !== +id) {
    throw ApiError.forbidden("You are not authorized to edit this profile");
  }

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.role === "job_seeker") {
    throw ApiError.forbidden("Confirm your email");
  }

  const { company_name, company_type, contact_info, team_size, clients, description } = req.body;

  let detail = await EmployerDetails.findOne({ where: { user_id: id } });
  if (!detail) {
    throw ApiError.badRequest("No employer details found");
  }

  await detail.update({
    company_name,
    company_type,
    contact_info,
    team_size,
    clients,
    description
  });

  return res.status(200).json({ message: "Profile updated" });
};

const getJobs = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.role === "job_seeker") {
    throw ApiError.forbidden("No employer details found");
  }

  const jobs = await Jobs.findAll({ where: { user_id: id } });

  return res.status(200).json(jobs);
}

const newJob = async (req, res) => {
  const {
    user_id,
    job_title,
    location,
    employment_type,
    min_salary,
    max_salary,
    short_summary,
    full_description,
    application_deadline,
    visibility,
    status,
  } = req.body;

  const job = await Jobs.create({
    user_id,
    job_title,
    location,
    employment_type,
    min_salary,
    max_salary,
    short_summary,
    full_description,
    application_deadline,
    visibility: visibility || "public",
    status: status || "draft",
  });

  return res.status(201).json(job.dataValues);
}

const updateJob = async (req, res) => {
  const { id } = req.params;
  const {
    job_title,
    location,
    employment_type,
    min_salary,
    max_salary,
    short_summary,
    full_description,
    application_deadline,
    visibility,
    status,
  } = req.body;

  const job = await Jobs.findOne({ where: { id } });

  if (!job) {
    throw ApiError.badRequest("No such job");
  }

  await job.update({
    job_title,
    location,
    employment_type,
    min_salary,
    max_salary,
    short_summary,
    full_description,
    application_deadline,
    visibility,
    status,
  });

  return res.status(200).json({ message: "Job updated" });
}

const filterJobs = async (req, res) => {
  const {
    min_salary,
    max_salary,
    location,
    employment_type,
    status,
    visibility,
  } = req.query;

  const where = {};

  if (min_salary) {
    where.min_salary = { [Op.gte]: +min_salary };
  }

  if (max_salary) {
    where.max_salary = { ...where.max_salary, [Op.lte]: +max_salary };
  }

  if (location) {
    where.location = location;
  }

  if (employment_type) {
    where.employment_type = employment_type;
  }

  if (status) {
    where.status = status;
  }

  if (visibility) {
    where.visibility = visibility;
  }

  const jobs = await Jobs.findAll({ where });

  return res.status(200).json(jobs);
};

const updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // статус може бути, наприклад, 'active', 'closed', 'draft'

  const job = await Jobs.findOne({ where: { id } });
  if (!job) {
    throw ApiError.badRequest("No such job");
  }

  await job.update({ status });

  return res.status(200).json({ message: "Job status updated" });
};


const deleteJob = async (req, res) => {
  const { id } = req.params;
  const job = await Jobs.findOne({ where: { id } });

  if (!job) {
    throw ApiError.badRequest("No such job");
  }

  await job.destroy();

  return res.status(200).json({ message: "Job deleted" });
};


const profileController = {
  getProfile,
  putProfile,
  getJobs,
  newJob,
  updateJob,
  filterJobs,
  deleteJob,
  updateJobStatus,
};

module.exports = profileController
