require("dotenv").config();
const { Router } = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const { catchError } = require("../utils/catchError");
const passportGoogle = require("../passport/passportGoogle");
const passportGithub = require("../passport/passportGithub.js");
const { ApiError } = require("../exceptions/api.error.js");

const router = Router();

const oauthCallbackHandler = async (req, res) => {
  if (Object.keys(req.user).length === 2) {
    return authController.saveNewUser(req, res);
  }

  return authController.getToken(req, res);
};

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
router.get("/google", passportGoogle.authenticate("google", { scope: ["profile", "email"] }));
router.get("/github", passportGithub.authenticate("github", { scope: ["user:email"] }));

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/' }),
  oauthCallbackHandler
);

router.get('/github/callback',
  passportGithub.authenticate('github', { failureRedirect: '/' }),
  oauthCallbackHandler
);

module.exports = router;
