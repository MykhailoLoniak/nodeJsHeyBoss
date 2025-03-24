require("dotenv").config();
const { Router } = require("express");
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const { catchError } = require("../utils/catchError");
const passportGoogle = require("../passport/passportGoogle");
const passportGithub = require("../passport/passportGithub.js");
const { ApiError } = require("../exceptions/api.error.js");

const router = Router();

const getToken = async (req, res) => {
  try {
console.log("---------------------------------------------------------------", req.user);


    const user = req.user;
    let tokens = await authController.generateTokens(res, req.user);
    if (!tokens) {
      throw new ApiError(401, "Unauthorized");
    }

    const redirectUrl = `${process.env.CLIENT_ORIGIN}/auth?firstName=${encodeURIComponent(user.first_name)}&lastName=${encodeURIComponent(user.last_name)}&accessToken=${encodeURIComponent(tokens.accessToken)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

const saveNewUser = (req, res) => {
  const email = req.user.email;
  // const profile_picture = req.user.profile_picture || "default_profile_picture_url";
  const redirectUrl = `${process.env.CLIENT_ORIGIN}/register?email=${email}`;

  return res.redirect(redirectUrl);
}

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
  async (req, res) => {
    if (Object.keys(req.user).length === 2) {
      saveNewUser(req, res)
      return;
    }

    return getToken(req, res)
  }
);

router.get(
  "/github/callback",
  passportGithub.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    if (Object.keys(req.user).length === 2) {
      saveNewUser(req, res)
      return;
    }

    return getToken(req, res)
  }
);

module.exports = router;
