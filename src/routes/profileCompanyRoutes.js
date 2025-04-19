require("dotenv").config();
const { Router } = require("express");

const { catchError } = require("../utils/catchError");
const profileController = require("../controllers/profileCompanyController");

const router = Router();

router.get("/:id", catchError(profileController.getProfile));
router.put("/:id", catchError(profileController.putProfile));
router.get("/get-jobs/:id", catchError(profileController.getJobs));
router.post("/newJob", catchError(profileController.newJob));
router.put("/update-job/:id", catchError(profileController.updateJob));
router.get("/filter-jobs", catchError(profileController.filterJobs));
router.delete("/delete-job/:id", catchError(profileController.deleteJob));
router.put("/job/:id/status", catchError(profileController.updateJobStatus));
router.get("/reviews/:id", catchError(profileController.getEmployerReviews));


module.exports = router;
