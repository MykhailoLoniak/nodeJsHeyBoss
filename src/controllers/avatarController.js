const { ApiError } = require("../exceptions/api.error");
const { ContractorDetails } = require("../models/contractorDetails");
const { EmployerDetails } = require("../models/employerDetails");
const { jwtService } = require("../services/jwtService");

const uploadAvatar = async (req, res) => {
  const id = req.params.id;
  const file = req.file;

  try {
    const { refresh_token } = req.cookies;
    const user = await jwtService.verifyRefresh(refresh_token);

    if (!user || !refresh_token) throw ApiError.unauthorized();
    if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");
    if (!file) throw ApiError.badRequest("File not provided")

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    let detail;

    if (user.role === "employer") {
      detail = await EmployerDetails.findOne({ where: { user_id: id } })
    } else if (user.role === "job_seeker") {
      detail = await ContractorDetails.findOne({ where: { user_id: id } })
    }

    detail.avatar = avatarUrl;
    await detail.save();

    res.status(200).json({ avatarUrl: `${process.env.BACKEND_ORIGIN}${avatarUrl}` });
  } catch {
    ((error) => {
      res.status(500).json({
        message: "Failed to update avatar",
        error,
      });
    })
  }
};

const getAvatar = async (req, res) => {
  const { id } = req.params;

  let detail;

  try {
    if (user.role === "employer") {
      detail = await EmployerDetails.findOne({ where: { user_id: id } })
    } else if (user.role === "job_seeker") {
      detail = await ContractorDetails.findOne({ where: { user_id: id } })
    }

    if (!detail || !detail.avatar) throw ApiError.notFound("Detalle del expediente electrónico")

    const avatarUrl = `${process.env.BACKEND_ORIGIN}${detail.avatar}`;

    return res.status(200).json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ err })
  }
}

const deleteAvatar = async (req, res) => {
  const { id } = req.params;

  const { refresh_token } = req.cookies;

  const user = await jwtService.verifyRefresh(refresh_token);

  if (!user || !refresh_token) throw ApiError.unauthorized();
  if (user.id !== +id) throw ApiError.forbidden("You are not authorized to edit this profile");

  let detail

  if (user.role === "employer") {
    detail = await EmployerDetails.findOne({ where: { user_id: id } })
  } else if (user.role === "job_seeker") {
    detail = await ContractorDetails.findOne({ where: { user_id: id } })
  }


  const urlImg = detail.avatar;
  const urlImgArr = urlImg.split("/");
  const url = urlImgArr[urlImgArr.length - 1]

  await detail.update(
    { avatar: null },
    { where: { user_id: id } }
  ).then(() => {
    deleteImage(url)

    res.status(200).json({ message: "Avatar successfully deleted", });
  }).catch((error) => {
    res.status(500).json({ error: "Failed to delete avatar" });
  })
}

const avatarController = {
  uploadAvatar,
  getAvatar,
  deleteAvatar
}

module.exports = avatarController;
