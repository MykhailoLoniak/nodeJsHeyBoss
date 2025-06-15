require("dotenv").config();
const { Router } = require("express");

const { catchError } = require("../utils/catchError");
const profileController = require("../controllers/profileCompanyController");

const router = Router();

router.get("/", catchError(profileController.getAllProfile));
router.get("/:id", catchError(profileController.getProfile));
router.patch("/:id", catchError(profileController.patchProfile));

router.get("/roles/job-seekers", catchError(profileController.getRole));
router.get("/skills/job-seekers/:id", catchError(profileController.getSkills));
router.get("/name/job-seekers/", catchError(profileController.findUsersBySkills));

module.exports = router;
