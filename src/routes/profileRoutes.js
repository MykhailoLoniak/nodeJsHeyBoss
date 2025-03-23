const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const profileController = require("./")

const router = Router();

router.get("/", catchError(profileController.))