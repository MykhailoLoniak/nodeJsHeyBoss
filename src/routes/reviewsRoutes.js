const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const  reviewsController  = require("../controllers/reviewsController");
const router = Router();

router.get("/:id", catchError(reviewsController.getReviews));
router.post("/from-job-seeker", catchError(reviewsController.postReviewFromJobSeeker));
router.post("/from-employer", catchError(reviewsController.postReviewFromEmployer));

module.exports = router;