const { Router } = require("express");
const { catchError } = require("../utils/catchError");
const router = Router();
const express = require('express');
const controller = require('../controllers/teamController');


router.post('/', catchError(controller.createTeam));

module.exports = router;
