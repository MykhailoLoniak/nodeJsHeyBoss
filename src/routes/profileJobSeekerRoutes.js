const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileJobSeekerController = require("../controllers/profileJobSeekerController");

const router = Router();

router.get("/", catchError(profileJobSeekerController.getAllProfile));
router.patch("/:id", catchError(profileJobSeekerController.patchProfile));
router.get("/:id", catchError(profileJobSeekerController.getProfile));

module.exports = router;