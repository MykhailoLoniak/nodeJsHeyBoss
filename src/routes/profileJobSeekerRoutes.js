const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileJobSeekerController = require("../controllers/profileJobSeekerController")

const router = Router();

router.put("/:id", catchError(profileJobSeekerController.putProfile));
router.get("/:id", catchError(profileJobSeekerController.getProfile));
router.get("/filter-jobs", catchError(profileJobSeekerController.filterJobs));
router.post("/comment", catchError(profileJobSeekerController.newComment));
router.get("/comments/:id", catchError(profileJobSeekerController.getComments));
router.post("/:id/avatar", catchError(profileJobSeekerController.uploadAvatar))

module.exports = router;