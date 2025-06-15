const { User } = require("../models/user");
const { EmployerDetails } = require("../models/employerDetails");
const userServices = require("../services/userService");
const ApiError = require("../exceptions/api.error");
const { jwtService } = require("../services/jwtService");
const roles = require("../constants/roleJobSeeker");
const skills = require("../constants/skills");
const { ContractorDetails } = require("../models/contractorDetails");
const { Op, where } = require("sequelize");

const getAllProfile = async (req, res) => {
  const users = await User.findAll({ where: { role: "employer" } });
  const userIds = users.map(user => user.id);

  const details = await EmployerDetails.findAll({
    where: { user_id: userIds }
  });

  const detailsMap = new Map(details.map(detail => [detail.user_id, detail]));

  const result = await Promise.all(users.map(async user => {
    const detail = detailsMap.get(user.id);
    const rating = await userServices.getRating(user.id);

    return {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      email: user.email,

      company_name: detail?.company_name || null,
      company_type: detail?.company_type || null,
      company_location: detail?.company_location || null,
      about: detail?.about || null,
      country: detail?.country || null,
      city: detail?.city || null,
      phone_number: detail?.phone_number || null,
      team_size: detail?.team_size || null,
      clients: detail?.clients || null,
      contact_info: detail?.contact_info || null,
      // rating: detail?.rating || null,
      avatar: userServices.dataUrl(detail?.avatar),
      rating: rating || null,
    };
  }));

  return res.status(200).json(result);
};

const getProfile = async (req, res) => {
  const { id } = req.params;

  const user = await userServices.getUser(+id);

  if (user.role === "job_seeker") throw ApiError.forbidden("No employer details found");

  const detail = await userServices.findByIdDetail(+user.id, user.role);

  const data = await userServices.mergeUserData(user, detail);

  return res.status(200).json(data);
};

const patchProfile = async (req, res) => {
  const { id } = req.params;
  const { refresh_token } = req.cookies;

  if (!refresh_token) throw ApiError.unauthorized("No refresh token provided");

  const user = await jwtService.verifyRefresh(refresh_token);

  if (!user) throw ApiError.unauthorized("Invalid refresh token");
  if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");
  if (user.role !== "employer") throw ApiError.forbidden("Access denied for this role");

  const {
    first_name,
    last_name,
    company_name,
    company_type,
    company_location,
    about,
    country,
    city,
    phone_number,
    team_size,
    clients,
    contact_info,

  } = req.body;

  const detail = await EmployerDetails.findOne({ where: { user_id: id } });
  if (!detail) throw ApiError.notFound("Employer details not found");

  const userRecord = await User.findByPk(id);
  if (!userRecord) throw ApiError.notFound("User not found");


  await userRecord.update({
    ...(first_name !== undefined && { first_name }),
    ...(last_name !== undefined && { last_name }),
  });

  await detail.update({
    ...(company_name !== undefined && { company_name }),
    ...(company_type !== undefined && { company_type }),
    ...(company_location !== undefined && { company_location }),
    ...(about !== undefined && { about }),
    ...(country !== undefined && { country }),
    ...(city !== undefined && { city }),
    ...(phone_number !== undefined && { phone_number }),
    ...(team_size !== undefined && { team_size }),
    ...(clients !== undefined && { clients }),
    ...(contact_info !== undefined && { contact_info }),

    // ...(rating !== undefined && { rating }),
  });

  const updatedUser = await userRecord.reload();
  const updatedDetail = await detail.reload();

  const data = await userServices.mergeUserData(updatedUser, updatedDetail);

  return res.status(200).json({ message: "Profile updated", data });
};

const getRole = (req, res) => {

  res.status(200).json(roles)
}

const getSkills = (req, res) => {
  const { id } = req.params;

  const data = skills.filter(skill => +skill.roleId === +id)

  res.status(200).json(data)
}

const findUsersBySkills = async (req, res) => {
  try {
    const rawSkills = req.query.skill;

    const skillIds = Array.isArray(rawSkills)
      ? rawSkills.map(Number)
      : [Number(rawSkills)];

    const skillsLabel = skills
      .filter(skill => skillIds
        .includes(+skill.id))
      .map(skill => skill.label)
    console.log("🧠 ID скілів:", skillIds);
    console.log("🧠 скіли:", skillsLabel);

    // const user = await User.findAll({ where: { id: user_id } })

    const userDetail = await ContractorDetails.findAll({
      where: {
        skills: {
          [Op.contains]: skillsLabel // перевірка на наявність *усіх* скілів
        }
      }
    });

    const usersNested = await Promise.all(
      userDetail.map(async detail => {
        const user = await userServices.getUser(detail.user_id);

        return {
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: `${process.env.BACKEND_ORIGIN}${detail.avatar}`,
          user_id: detail.user_id
        };
      })
    );

    // Плоский масив (опціонально):
    const users = usersNested.flat(); // якщо потрібно об'єднати всі внутрішні масиви в один


    res.status(200).json(users)
  } catch (error) {
    console.error("findUsersBySkills_____________", error);

  }
};

const profileController = {
  getAllProfile,
  getProfile,
  patchProfile,
  getRole,
  getSkills,
  findUsersBySkills,
};

module.exports = profileController
