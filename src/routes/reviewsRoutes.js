const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const { reviewsController } = require("../controllers/reviewsController");
const router = Router();

// router.get("/id", catchError(reviewsController.getAllReviews));
// router.put("/:id", catchError(profileJobSeekerController.putProfile));
// router.get("/:id", catchError(profileJobSeekerController.getProfile));

module.exports = router;