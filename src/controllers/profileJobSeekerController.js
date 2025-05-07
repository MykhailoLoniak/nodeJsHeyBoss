const { ApiError } = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const userServices = require("../services/userService");
const { User } = require("../models/user");
const { ContractorDetails } = require("../models/contractorDetails");
const { Project } = require("../models/project");
require('dotenv').config();


const getAllProfile = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'job_seeker' } });
    const userIds = users.map(user => user.id);

    const details = await ContractorDetails.findAll({
      where: { user_id: userIds }
    });

    const detailsMap = new Map(details.map(detail => [detail.user_id, detail]));

    const result = await Promise.all(users.map(async user => {
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
        avatar: dataUrls(detail?.avatar) || null,
        contact_info: detail?.contact_info || null,
        rating: await userServices.getRating(user.id) || null,
        company: detail?.company || null,

      };
    }));

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
    avatar: dataUrls(detail?.avatar) || null,
    contact_info: detail?.contact_info || null,
    rating: await userServices.getRating(user.id) || null,
    company: detail?.company || null,
  }

  return res.status(200).json(data);
};

const patchProfile = async (req, res) => {
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
    company,
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
    ...(first_name !== undefined && { first_name }),
    ...(last_name !== undefined && { last_name }),
    ...(email !== undefined && { email }),
  });

  await detail.update({
    ...(job_category !== undefined && { job_category }),
    ...(work_experience !== undefined && { work_experience }),
    ...(portfolio !== undefined && { portfolio }),
    ...(section_title !== undefined && { section_title }),
    ...(description !== undefined && { description }),
    ...(country !== undefined && { country }),
    ...(location !== undefined && { location }),
    ...(city !== undefined && { city }),
    ...(phone_number !== undefined && { phone_number }),
    ...(contact_info !== undefined && { contact_info }),
    ...(company !== undefined && { company }),
  });

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
    avatar: dataUrls(detail?.avatar) || null,
    contact_info: detail?.contact_info || null,
    company: detail?.company || null,
  }

  return res.status(200).json(data)
}

function dataUrls(urls) {
  return urls.map(url => `${process.env.BACKEND_ORIGIN}${url}`)
}

const getProjects = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "employer") {
      return res.status(403).json({ message: "User is not a job seeker" });
    }

    const projects = await Project.findAll({ where: { contractor_id: id } });

    const data = projects.map(project => ({
      // ...project.toJSON(),
      projekt_id: project.id,
      user_id: project.contractor_id,
      title: project.title,
      description: project.description,
      media: dataUrls(url) || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects", error });
  }
};

const patchProjects = async (req, res) => {
  const { id, projectId } = req.params;
  const { title, description } = req.body;
  const portfolioFiles = req.files?.portfolio || [];

  const mediaUrls = portfolioFiles.map(f => `/uploads/portfolios/${f.filename}`);

  try {
    const { refresh_token } = req.cookies;
    if (!refresh_token) throw ApiError.unauthorized();

    const user = await jwtService.verifyRefresh(refresh_token);
    if (!user) throw ApiError.unauthorized();

    if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");
    if (user.role === "employer") throw ApiError.badRequest("User is not a job seeker");

    const project = await Project.findOne({ where: { id: projectId, contractor_id: id } });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const patch = await project.update({
      ...(title && { title }),
      ...(description && { description }),
      ...(mediaUrls.length > 0 && { media: mediaUrls }),
    });

    const data = patch.map(project => ({
      // ...project.toJSON(),
      projekt_id: project.id,
      user_id: project.contractor_id,
      title: project.title,
      description: project.description,
      media: dataUrls(url) || [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to update project", error });
  }
};

const postProjects = async (req, res) => {
  try {
    const id = req.params.id;

    const { title, description } = req.body
    const portfolioFiles = req.files.portfolio || [];

    const mediaUrls = portfolioFiles.map(f => `/uploads/portfolios/${f.filename}`);

    const { refresh_token } = req.cookies;
    if (!refresh_token) throw ApiError.unauthorized();

    const user = await jwtService.verifyRefresh(refresh_token);
    if (!user) throw ApiError.unauthorized();

    if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");

    if (user.role === "employer") {
      throw ApiError.badRequest('User is not a job seeker');
    }
    console.log("_____________________________");

    const projekt = await Project.create({
      contractor_id: id,
      title,
      description,
      media: dataUrls(mediaUrls) || [],
    })

    res.status(200).json(projekt);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error,
    });
  }
}


const profileJobSeekerController = {
  getAllProfile,
  patchProfile,
  getProfile,

  getProjects,
  patchProjects,
  postProjects,
}

module.exports = profileJobSeekerController;
