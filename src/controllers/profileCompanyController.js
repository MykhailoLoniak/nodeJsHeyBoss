const { Op, where } = require("sequelize");

const { User } = require("../models/user");
const { EmployerDetails } = require("../models/employerDetails");
const { EmployerReviews } = require("../models/employerReviews");
const userServices = require("../services/userService");
const ApiError = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const { Jobs } = require("../models/jobs");
const jobService = require("../services/jobService");


const getProfile = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (user.role === "job_seeker") throw ApiError.forbidden("No employer details found");

  const detail = await userServices.findByIdDetail(+user.id, user.role);

  const data = userServices.mergeUserData(user, detail);

  return res.status(200).json(data);
};

const putProfile = async (req, res) => {
  const { id } = req.params;

  const { refresh_token } = req.cookies;

  const user = await jwtService.verifyRefresh(refresh_token);

  if (!user || !refresh_token) throw ApiError.unauthorized();
  if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");
  if (user.role !== "employer") throw ApiError.forbidden("Confirm your email");

  const { company_name, company_type, contact_info, team_size, clients, description, company_location } = req.body;

  const detail = await EmployerDetails.findOne({ where: { user_id: id } });

  if (!detail) throw ApiError.forbidden("Only employers can edit profile");
  if (company_name && typeof company_name !== 'string') throw ApiError.badRequest("Invalid company name");
  if (company_type && typeof company_type !== 'string') throw ApiError.badRequest("Invalid company type");
  if (team_size && typeof team_size !== 'string') throw ApiError.badRequest("Invalid team size");
  if (description && typeof description !== 'string') throw ApiError.badRequest("Invalid description");
  if (company_location && typeof company_location !== 'string') throw ApiError.badRequest("Invalid company location");
  if (contact_info && !Array.isArray(contact_info)) throw ApiError.badRequest("Invalid contact info");
  if (clients && typeof clients !== 'string') throw ApiError.badRequest("Invalid clients");

  if (company_name) detail.company_name = company_name;
  if (company_type) detail.company_type = company_type;
  if (contact_info) detail.contact_info = contact_info;
  if (team_size) detail.team_size = team_size;
  if (clients) detail.clients = clients;
  if (description) detail.description = description;
  if (company_location) detail.company_location = company_location;

  await detail.save();

  const data = userServices.mergeUserData(user, detail);

  return res.status(200).json({ message: "Profile updated", data, });
};

const getJobs = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (user.role === "job_seeker") throw ApiError.forbidden("No employer details found");

  const jobs = await jobService.getJobs(id)

  return res.status(200).json(jobs);
}

const newJob = async (req, res) => {
  if (req.body.min_salary && req.body.max_salary && +req.body.min_salary > +req.body.max_salary) {
    throw ApiError.badRequest("Min salary can't be more than max salary");
  }

  const job = await jobService.newJob(req)

  return res.status(201).json(job);
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

  const job = await jobService.gerOneJob(id)

  if (!job) throw ApiError.badRequest("No such job");

  const currentUser = await jwtService.verifyRefresh(req.cookies.refresh_token);

  if (job.user_id !== currentUser.id) throw ApiError.forbidden("You are not allowed to update this job");

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

  if (min_salary && max_salary && +min_salary > +max_salary) {
    throw ApiError.badRequest("Min salary cannot be greater than max salary");
  }

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

  const currentUser = await jwtService.verifyRefresh(req.cookies.refresh_token);

  if (job.user_id !== currentUser.id) {
    throw ApiError.forbidden("You are not allowed to delete this job");
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

  const currentUser = await jwtService.verifyRefresh(req.cookies.refresh_token);
  if (job.user_id !== currentUser.id) {
    throw ApiError.forbidden("You are not allowed to delete this job");
  }

  await job.destroy();

  return res.status(200).json({ message: "Job deleted" });
};

const getEmployerReviews = async (req, res) => {
  const { id } = req.params;

  const user = await User.findAll({ where: { id } });

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  if (user.role === "employer") {
    throw ApiError.forbidden("No employer reviews found");
  }

  const reviews = await EmployerReviews.findAll({ where: { employer_id: id } });

  return res.status(200).json(reviews);
}

const newEmployerReviews = async (req, res) => {
  const { rating, comment, job_id, reviewer_id, employer_id } = req.body;

  const reviewer = await User.findAll({ where: { reviewer_id } });

  if (!reviewer) {
    throw ApiError.badRequest("No such reviewer");
  }

  const employer = await User.findAll({ where: { employer_id } });

  if (!employer) {
    throw ApiError.badRequest("No such employer");
  }

  const job = await Jobs.findAll({ where: { job_id } });

  if (!job) {
    throw ApiError.badRequest("No such job");
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

  const review = await EmployerReviews.create({
    employer_id,
    reviewer_id,
    rating,
    comment,
    job_id,
  });

  return res.status(201).json(review.dataValues);
}

const uploadAvatar = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Файл не надано" });
  }

  const avatarUrl = `/uploads/avatars/${file.filename}`;

  EmployerDetails.update(
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
  }
  )
};

const getAvatar = (req, res) => {
  const { id } = req.params;

  const detail = EmployerDetails.findOne({ where: { user_id: id } })

  if (!detail || !detail.avatar) {
    return res.status(404).json({ error: "Avatar not found" });
  }

  const avatarUrl = `${process.env.BACKEND_ORIGIN}${detail.avatar}`;

  return res.status(200).json({ avatarUrl });
}

const deleteAvatar = async (req, res) => {
  const { id } = req.params;

  const { refresh_token } = req.cookies;

  const user = await jwtService.verifyRefresh(refresh_token);

  if (!user || !refresh_token) throw ApiError.unauthorized();
  if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");

  const detail = EmployerDetails.findOne({ where: { user_id: id } })


}

const profileController = {
  getProfile,
  putProfile,
  getJobs,
  newJob,
  updateJob,
  filterJobs,
  deleteJob,
  updateJobStatus,
  getEmployerReviews,
  newEmployerReviews,
  uploadAvatar,
  getAvatar,
};

module.exports = profileController
