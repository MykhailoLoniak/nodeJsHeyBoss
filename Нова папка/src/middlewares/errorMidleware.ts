const { ApiError: Err } = require("../exeptions/api.error");

/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

const errorMidleware = (error, req, res, next) => {
  if (error instanceof Err) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  if (error) {
    res.statusCode = 500;

    res.send({
      message: "Server error",
      error,
    });
  }

  next();
};

module.exports = {
  errorMidleware,
};
