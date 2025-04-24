const { Jobs } = require("../models/jobs");

const getJobs = async (user_id) => {
  return await Jobs.findAll({ where: { user_id } });
}

const gerOneJob = async (id) => {
  return await Jobs.findOne({ where: { id } });
}

const newJob = async (req) => {
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
    application_deadline: application_deadline.toLowerCase(),
    visibility: visibility.toLowerCase() || "public",
    status: status || "draft",
  });

  return job.dataValues
}

const jobService = {
  getJobs,
  newJob,
  gerOneJob
}

module.exports = jobService;