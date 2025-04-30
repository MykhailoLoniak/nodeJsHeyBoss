require("dotenv").config();
const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const avatarController = require("../controllers/avatarController");
const avatarMiddleware = require("../middlewares/avatarMiddleware");

const router = Router();

router.post("/:id", avatarMiddleware, catchError(avatarController.uploadAvatar));
router.get("/:id", avatarMiddleware, catchError(avatarController.getAvatar));
router.delete("/:id", avatarMiddleware, catchError(avatarController.deleteAvatar));

module.exports = router;
