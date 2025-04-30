const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileJobSeekerController = require("../controllers/profileJobSeekerController");
const avatarMiddleware = require("../middlewares/avatarMiddleware");

const router = Router();

router.get("/", catchError(profileJobSeekerController.getAllProfile));
router.put("/:id", catchError(profileJobSeekerController.putProfile));
router.get("/:id", catchError(profileJobSeekerController.getProfile));
router.delete("/:id", catchError(profileJobSeekerController.deleteProfile));

router.get("job", catchError(profileJobSeekerController.getJob))
router.get("/filter-jobs", catchError(profileJobSeekerController.filterJobs));

router.post("/reviews", catchError(profileJobSeekerController.newComment));
router.get("/reviews/:id", catchError(profileJobSeekerController.getComments));

module.exports = router;