// routes/authRoutes.js
import express, { Request, Response, NextFunction } from "express";
import authController from "../controllers/authController";
import { Router } from "express";

const router = Router();

// router.post('/login', authController.login);
router.post("/register", authController.register);

// module.exports = router;

export default router;
