require("dotenv").config();
const { Router } = require("express");

const { catchError } = require("../utils/catchError");
const profileController = require("../controllers/profileCompanyController");

const router = Router();

router.get("/", catchError(profileController.getAllProfile));
router.get("/:id", catchError(profileController.getProfile));
router.patch("/:id", catchError(profileController.patchProfile));

module.exports = router;
