/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

const catchError = (action) => {
  return async function (req, res, next) {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { catchError };
