const { ApiError } = require("../exceptions/api.error");

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  if (error) {
    res.statusCode = 500;

    res.send({
      message: "Server error",
      error,
    });

    return;
  }

  next();
};

module.exports = {
  errorMiddleware,
};
