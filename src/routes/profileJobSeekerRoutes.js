const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileJobSeekerController = require("../controllers/profileJobSeekerController");
const uploadMiddleware = require("../middlewares/uploadsMiddleware");

const router = Router();

router.get("/", catchError(profileJobSeekerController.getAllProfile));
router.patch("/:id", catchError(profileJobSeekerController.patchProfile));
router.get("/:id", catchError(profileJobSeekerController.getProfile));

router.get('/project', uploadMiddleware, catchError(profileJobSeekerController.getProject))
router.patch('/project', uploadMiddleware, catchError(profileJobSeekerController.patchProject))
router.post('/project/:id', uploadMiddleware ,catchError(profileJobSeekerController.postProject))


module.exports = router;