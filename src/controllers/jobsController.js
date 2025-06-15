const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const { Job } = require('../models/job');
const { Op } = require("sequelize");

const VALID_APPLICATION_DEADLINES = ['via platform inbox', 'external link', 'by email'];
const VALID_VISIBILITY = ['public', 'private', 'internal'];
const VALID_STATUS = ['active', 'closed', 'draft'];

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();

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

    const jobs = await Job.findAll({ where: { company_id: id } });
    if (!jobs) throw ApiError.badRequest('No job with this ID found')

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
      // status,
      createdAt,
      updatedAt
    } = req.query;

    const where = {};

    const simpleFields = {
      job_title,
      location,
      employment_type,
      // status,
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

    const jobs = await Job.findAll({ where });

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
      application_deadline,
      company_id,
      job_title,
      min_salary,
      max_salary,
      visibility,
      
      location,
      employment_type,
      short_summary,
      full_description,
      // status,
    } = req.body;

    if (!company_id || isNaN(Number(company_id))) {
      throw ApiError.badRequest("company_id must be a number");
    }

    if (!job_title || typeof job_title !== 'string') {
      throw ApiError.badRequest("job_title required and must be a string");
    }

    if (min_salary !== undefined) {
      if (isNaN(Number(min_salary)) || Number(min_salary) < 0) {
        throw ApiError.badRequest("min_salary must be a non-negative number");
      }
    }

    if (max_salary !== undefined) {
      if (isNaN(Number(max_salary)) || Number(max_salary) < 0) {
        throw ApiError.badRequest("max_salary must be a non-negative number");
      }
    }

    if (min_salary !== undefined && max_salary !== undefined) {
      if (Number(min_salary) > Number(max_salary)) {
        throw ApiError.badRequest("min_salary cannot be greater than max_salary");
      }
    }

    if (application_deadline && !VALID_APPLICATION_DEADLINES.includes(application_deadline)) {
      throw ApiError.badRequest(`application_deadline must be one of: ${VALID_APPLICATION_DEADLINES.join(', ')}`);
    }

    if (visibility && !VALID_VISIBILITY.includes(visibility)) {
      throw ApiError.badRequest(`visibility must be one of: ${VALID_VISIBILITY.join(', ')}`);
    }

    // if (status && !VALID_STATUS.includes(status)) {
    //   throw ApiError.badRequest(`status must be one of: ${VALID_STATUS.join(', ')}`);
    // }

    const job = await Job.create({
      company_id: Number(company_id),
      job_title,
      location,
      employment_type,
      min_salary: min_salary !== undefined ? Number(min_salary) : null,
      max_salary: max_salary !== undefined ? Number(max_salary) : null,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      // status,
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const patchJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const {
      company_id,
      job_title,
      location,
      employment_type,
      short_summary,
      full_description,
      application_deadline,
      visibility,
      min_salary,
      max_salary,
    } = req.body;

    const updates = {};

    // if (company_id !== undefined) {
    //   if (isNaN(Number(company_id))) {
    //     return res.status(400).json({ message: "company_id must be a number" });
    //   }
    //   updates.company_id = Number(company_id);
    // }

    if (job_title !== undefined) updates.job_title = job_title;
    if (location !== undefined) updates.location = location;
    if (employment_type !== undefined) updates.employment_type = employment_type;
    if (short_summary !== undefined) updates.short_summary = short_summary;
    if (full_description !== undefined) updates.full_description = full_description;

    if (application_deadline !== undefined) {
      if (!VALID_APPLICATION_DEADLINES.includes(application_deadline)) {
        return res.status(400).json({
          message: `application_deadline must be one of: ${VALID_APPLICATION_DEADLINES.join(', ')}`
        });
      }
      updates.application_deadline = application_deadline;
    }

    if (visibility !== undefined) {
      if (!VALID_VISIBILITY.includes(visibility)) {
        return res.status(400).json({
          message: `visibility must be one of: ${VALID_VISIBILITY.join(', ')}`
        });
      }
      updates.visibility = visibility;
    }

    if (min_salary !== undefined) {
      if (isNaN(Number(min_salary)) || Number(min_salary) < 0) {
        return res.status(400).json({ message: "min_salary must be a non-negative number" });
      }
      updates.min_salary = Number(min_salary);
    }

    if (max_salary !== undefined) {
      if (isNaN(Number(max_salary)) || Number(max_salary) < 0) {
        return res.status(400).json({ message: "max_salary must be a non-negative number" });
      }
      updates.max_salary = Number(max_salary);
    }

    if (updates.min_salary !== undefined && updates.max_salary !== undefined) {
      if (updates.min_salary > updates.max_salary) {
        return res.status(400).json({ message: "min_salary cannot be greater than max_salary" });
      }
    }

    const [updatedCount] = await Job.update(updates, { where: { id } });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "No job found or nothing updated" });
    }

    const updatedJob = await Job.findByPk(id);
    return res.status(200).json({ message: "Updated successfully", job: updatedJob });

  } catch (error) {
    console.error("Error updating job:", error);
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
    const job = await Job.findOne({ where: { id } });

    if (!job) throw ApiError.notFound("Job not found");
    if (+userData.id !== +job.company_id) {
      throw ApiError.forbidden("You are not authorized to delete this job");
    }

    await Job.destroy({
      where: { id },
    });

    res.status(200).json({ message: "Job deleted" })
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const jobsController = {
  getAllJobs,
  getJobs,
  filterJobs,
  newJobs,
  patchJob,
  deleteJob
}

module.exports = jobsController;
