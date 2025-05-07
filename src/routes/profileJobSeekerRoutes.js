const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileJobSeekerController = require("../controllers/profileJobSeekerController");
const uploadMiddleware = require("../middlewares/uploadsMiddleware");

const router = Router();

router.get("/", catchError(profileJobSeekerController.getAllProfile));
router.patch("/:id", catchError(profileJobSeekerController.patchProfile));
router.get("/:id", catchError(profileJobSeekerController.getProfile));

router.get('/project/:id', uploadMiddleware, catchError(profileJobSeekerController.getProjects))
router.patch('/project/:id/:projectId', uploadMiddleware, catchError(profileJobSeekerController.patchProjects))
router.post('/project/:id', uploadMiddleware, catchError(profileJobSeekerController.postProjects))
// router.post('/project/img/:id', uploadMiddleware, catchError(profileJobSeekerController.postImgProjects))


module.exports = router;