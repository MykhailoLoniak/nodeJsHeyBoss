const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const taskController = require("../controllers/taskController");
const router = Router();

router.post("/", catchError(taskController.newTask));

module.exports = router;