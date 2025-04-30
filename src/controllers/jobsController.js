const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const { Jobs } = require('../models/jobs');
const { Op } = require("sequelize");

const VALID_APPLICATION_DEADLINES = ['via platform inbox', 'external link', 'by email'];
const VALID_VISIBILITY = ['public', 'private', 'internal'];
const VALID_STATUS = ['active', 'closed', 'draft'];

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.findAll();

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error getAllJobs", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const getJobs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw ApiError.badRequest('ID parameter is required')

    const jobs = await Jobs.findAll({ where: { company_id: id } });
    if (!id) throw ApiError.badRequest('No job with this ID found')

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error getJobs", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const filterJobs = async (req, res) => {
  try {
    const {
      min_salary,
      max_salary,
      company_id,
      job_title,
      location,
      employment_type,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      status,
      createdAt,
      updatedAt
    } = req.query;

    const where = {};

    const simpleFields = {
      job_title,
      location,
      employment_type,
      status,
      short_summary,
      full_description,
      application_deadline,
      visibility,
    };

    for (const [key, value] of Object.entries(simpleFields)) {
      if (value !== undefined) {
        where[key] = value;
      }
    }

    if (company_id !== undefined) {
      const parsedCompanyId = Number(company_id);
      if (isNaN(parsedCompanyId)) {
        return res.status(400).json({ message: "Invalid company_id. Must be a number." });
      }
      where.company_id = parsedCompanyId;
    }

    if (min_salary || max_salary) {
      where.salary = {};
      if (min_salary) where.salary[Op.gte] = Number(min_salary);
      if (max_salary) where.salary[Op.lte] = Number(max_salary);
    }

    if (createdAt) {
      where.createdAt = { [Op.gte]: new Date(createdAt) };
    }

    if (updatedAt) {
      where.updatedAt = { [Op.gte]: new Date(updatedAt) };
    }

    const jobs = await Jobs.findAll({ where });

    if (!jobs.length) {
      return res.status(404).json({ message: "No jobs found" });
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Filter error", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const newJobs = async (req, res, next) => {
  try {
    const {
      company_id,
      job_title,
      location,
      employment_type,
      salary,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      status,
    } = req.body;

    if (!company_id || isNaN(Number(company_id))) {
      throw ApiError.badRequest("company_id must be a number");
    }

    if (!job_title || typeof job_title !== 'string') {
      throw ApiError.badRequest("job_title required and must be a string");
    }

    if (salary !== undefined && isNaN(Number(salary))) {
      throw ApiError.badRequest("salary must be a number");
    }

    if (application_deadline && !VALID_APPLICATION_DEADLINES.includes(application_deadline)) {
      throw ApiError.badRequest(`application_deadline must be one of: ${VALID_APPLICATION_DEADLINES.join(', ')}`);
    }

    if (visibility && !VALID_VISIBILITY.includes(visibility)) {
      throw ApiError.badRequest(`visibility must be one of: ${VALID_VISIBILITY.join(', ')}`);
    }

    if (status && !VALID_STATUS.includes(status)) {
      throw ApiError.badRequest(`status must be one of: ${VALID_STATUS.join(', ')}`);
    }

    const job = await Jobs.create({
      company_id: Number(company_id),
      job_title,
      location,
      employment_type,
      salary: salary !== undefined ? Number(salary) : null,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      status,
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const putJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw ApiError.badRequest("Invalid job ID");
    }

    const {
      company_id,
      job_title,
      location,
      employment_type,
      salary,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      status,
    } = req.body;

    if (company_id !== undefined && isNaN(Number(company_id))) {
      throw ApiError.badRequest("company_id must be a number");
    }

    if (salary !== undefined && isNaN(Number(salary))) {
      throw ApiError.badRequest("salary must be a number");
    }

    if (application_deadline && !VALID_APPLICATION_DEADLINES.includes(application_deadline)) {
      throw ApiError.badRequest(`application_deadline must be one of: ${VALID_APPLICATION_DEADLINES.join(', ')}`);
    }

    if (visibility && !VALID_VISIBILITY.includes(visibility)) {
      throw ApiError.badRequest(`visibility must be one of: ${VALID_VISIBILITY.join(', ')}`);
    }

    if (status && !VALID_STATUS.includes(status)) {
      throw ApiError.badRequest(`status must be one of: ${VALID_STATUS.join(', ')}`);
    }

    const [updatedCount] = await Jobs.update(
      {
        company_id,
        job_title,
        location,
        employment_type,
        salary,
        short_summary,
        full_description,
        application_deadline,
        visibility,
        status
      },
      { where: { id } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "No job found or nothing updated" });
    }

    const updatedJob = await Jobs.findByPk(id);

    res.status(200).json({ message: "Updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

    let userData = await jwtService.verifyRefresh(refresh_token);
    if (!userData) {
      res.clearCookie("refresh_token");
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const { id } = req.params;
    const job = Jobs.findOne({ where: { id } })
    if (+userData.id !== +job.company_id) {
      throw ApiError.forbidden("You are not authorized to edit this profile");
    }

    await Jobs.destroy({
      where: { id },
    });

    res.status(200).json({ message: "Job deleted" })
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const jobsController = {
  getAllJobs,
  getJobs,
  filterJobs,
  newJobs,
  putJob,
  deleteJob
}

module.exports = jobsController;
