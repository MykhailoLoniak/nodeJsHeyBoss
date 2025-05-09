const { where } = require("sequelize");
const { ApiError } = require("../exceptions/api.error");
const userService = require("../services/userService");
const { ReviewFromEmployer, ReviewFromJobSeeker } = require("../models");
require('dotenv').config();
const mergeReviews = async (currentUser, reviews) => {
  const isCurrentUserEmployer = currentUser.role === "employer";

  const data = await Promise.all(
    reviews.map(async (review) => {
      // Залежно від ролі поточного користувача, беремо іншого (того, хто залишив відгук)
      const targetUserId = isCurrentUserEmployer ? review.job_seeker_id : review.employer_id;
      const targetUser = await userService.getUser(targetUserId);
      const targetUserDetails = await userService.findByIdDetail(targetUser.id, targetUser.role);

      return {
        user_name: `${targetUser.first_name} ${targetUser.last_name}`,
        user_avatar: `${process.env.BACKEND_ORIGIN}${targetUserDetails.avatar}`,
        comment: review.comment,
        createdAt: review.createdAt,
        job_seeker_id: review.job_seeker_id,
        employer_id: review.employer_id,
        job_id: review.job_id,
        id: review.id,
        rating: review.rating,
      };
    })
  );

  return data;
};



getReviews = async (req, res) => {
  const { id } = req.params;

  if (!id) throw ApiError.BadRequest("id is required");

  const user = await userService.getUser(id);

  if (!user) throw ApiError.BadRequest("User not found");

  const { role } = user;

  if (role === "job_seeker") {
    const reviews = await ReviewFromEmployer.findAll({ where: { job_seeker_id: id } })
    const data = await mergeReviews(user, reviews)

    return res.status(200).json(data);
  }

  if (role === "employer") {
    const reviews = await ReviewFromJobSeeker.findAll({ where: { employer_id: id } })

    const data = await mergeReviews(user, reviews)

    return res.status(200).json(data);
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