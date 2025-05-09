const { where } = require("sequelize");
const { ApiError } = require("../exceptions/api.error");
const userService = require("../services/userService");
const { ReviewFromEmployer, ReviewFromJobSeeker } = require("../models");

const margeReviews = (user, reviews) => ({
  user_name: user.user_name,
  user_avatar: user.user_avatar,
  job_seeker_id: user.id,
  comment: reviews.comment,
  createdAt: reviews.createdAt,
  employer_id: reviews.employer_id,
  job_id: reviews.job_id,
  id: reviews.id,
  rating: reviews.rating,

})

getReviews = async (req, res) => {
  const { id } = req.params;

  if (!id) throw ApiError.BadRequest("id is required");

  const user = await userService.getUser(id);

  if (!user) throw ApiError.BadRequest("User not found");

  const { role } = user;

  if (role === "job_seeker") {
    const reviews = await ReviewFromEmployer.findAll({ where: { job_seeker_id: id } })

    return res.status(200).json(margeReviews(user, reviews));
  }

  if (role === "employer") {
    const reviews = await ReviewFromJobSeeker.findAll({ where: { employer_id: id } })

    return res.status(200).json(margeReviews(user, reviews));
  }

  if (role !== "job_seeker" && role !== "employer") {
    throw ApiError.BadRequest("Invalid user role");
  }
}

const postReviewFromJobSeeker = async (req, res) => {
  const { rating, comment, employer_id, job_seeker_id, job_id } = req.body;

  if (!rating || !comment || !employer_id || !job_id || !job_seeker_id) {
    throw ApiError.BadRequest("rating, comment, employer_id, job_id and job_seeker_id are required");
  }

  const review = await ReviewFromJobSeeker.create({ rating, comment, employer_id, job_seeker_id, job_id });

  return res.status(201).json(review);
};

const postReviewFromEmployer = async (req, res) => {
  const { rating, comment, employer_id, job_seeker_id, job_id } = req.body;

  if (!rating || !comment || !employer_id || !job_id || !job_seeker_id) {
    throw ApiError.BadRequest("rating, comment, employer_id, job_id and job_seeker_id are required");
  }

  const review = await ReviewFromEmployer.create({ rating, comment, employer_id, job_seeker_id, job_id });

  return res.status(201).json(review);
};



const reviewsController = {
  getReviews,
  postReviewFromEmployer,
  postReviewFromJobSeeker,
}

module.exports = reviewsController;