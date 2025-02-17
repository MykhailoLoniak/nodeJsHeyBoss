import express, { Request, Response, NextFunction } from "express";
// import { uuid } from "uuidv4";
import { v4 as uuid } from "uuid";
import { validators } from "../utils/validators";
import ApiError from "../exeptions/api.error";
import userService from "../services/user.service";
import bcrypt from "bcrypt";
import { UserRegist } from "../types/UserRegist";
import emailService from "../services/email.service";
import User from "../models/user";

const register = async (req: Request, res: Response) => {
  try {
    const {
      id,
      firstName,
      lastName,
      phone,
      email,
      password: pass,
      role,
      avatarUrl,
      dateOfBirth,
    } = req.body;
    console.log(req.body);

    const activationToken = uuid();

    const errors = {
      email: validators.validateEmail(email),
      password: validators.validatePassword(pass),
    };

    if (!errors.email) {
      throw ApiError.badRequest(
        `Invalid email address.
      Please enter a valid email address in the format "example@example.com".`,
        errors
      );
    }

    if (!errors.password) {
      throw ApiError.badRequest(
        `Incorrect password.
      The length of the fault must be at least 6 characters`,
        errors
      );
    }

    const existUser = await userService.findByEmail(email);

    if (existUser) {
      throw ApiError.badRequest("User Already exist", {
        email: "User already exist",
      });
    }

    const password = await bcrypt.hash(pass, 10);
    const newUser = await User.create({
      id,
      firstName,
      lastName,
      phone,
      email,
      password: pass,
      role,
      avatarUrl,
      dateOfBirth,
      activationToken,
    });

    await emailService.sendActivationEmail(email, activationToken);

    res.send(newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("error________________:", error.message);
    } else {
      console.log("Unknown error");
    }
  }
};

const authController = {
  // login,
  register,
};

export default authController;
