const { where } = require("sequelize");
const { ApiError } = require("../exceptions/api.error");
const userService = require("../services/userService");

getAllReviews = async (req, res) => { 
  const { id } = req.params;
  if (!id) throw ApiError.BadRequest("id is required");

  const user = userService.getUser(id);
  if (!user) throw ApiError.BadRequest("User not found");
  const { role } = user;

  if (role === "job_seeker") { 
    const reviews  = await ReviewFromEmployer.findAll({where:{}})

  }



}

const reviewsController = {
 getAllReviews,
}

module.exports = reviewsController;