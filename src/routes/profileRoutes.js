const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileController = require("../controllers/profileController")

const router = Router();

router.get("/", catchError(profileController.getProfile));
router.get("/:id", catchError(profileController.getUserById));
router.get("/job-seeker", catchError(profileController.getJobSeekers));
router.get("/employer", catchError(profileController.getEmployers));

module.exports = router;