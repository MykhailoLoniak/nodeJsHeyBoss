const { Router } = require("express");
const authController = require("../controllers/authController");
const { catchError: catchErrors } = require("../utils/catchError");

const router = Router();

router.post("/register", catchErrors(authController.register));
router.get(
  "/activation/:activationToken",
  catchErrors(authController.activate)
);
router.post("/login", catchErrors(authController.login));
router.delete("/logout", catchErrors(authController.logout));
router.get("/refresh", catchErrors(authController.refresh));
router.post(
  "/request-password-reset",
  catchErrors(authController.requestPasswordReset)
);
router.post(
  "/password-reset/:passwordResetToken",
  catchErrors(authController.passwordReset)
);

module.exports = router;
