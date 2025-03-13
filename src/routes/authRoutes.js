const { Router } = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const { catchError } = require("../utils/catchError");

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 10, // максимум 10 спроб
  message: "Too many login attempts, please try again later",
});

router.post("/register", catchError(authController.register));
router.get("/activation/:token", catchError(authController.activate));
router.post("/login", loginLimiter, catchError(authController.login));
router.delete("/logout", catchError(authController.logout));
router.get("/refresh", catchError(authController.refresh));
router.post("/request-password-reset", loginLimiter, catchError(authController.requestPasswordReset));
router.put("/password-reset/:token", catchError(authController.passwordReset));

module.exports = router;
