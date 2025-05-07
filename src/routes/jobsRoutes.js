const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const jobsController = require("../controllers/jobsController");

const router = Router();

router.get("/", catchError(jobsController.getAllJobs))
router.post("/", catchError(jobsController.newJobs))
router.get("/filter-jobs", catchError(jobsController.filterJobs));
router.get("/:id", catchError(jobsController.getJobs))
router.patch("/:id", catchError(jobsController.patchJob))
router.delete("/:id", catchError(jobsController.deleteJob))

module.exports = router;