interface ErrorDetails {
  [key: string]: any;
}

class ApiError extends Error {
  status: number;
  errors: ErrorDetails;

  constructor({
    message,
    status,
    errors = {},
  }: {
    message: string;
    status: number;
    errors?: ErrorDetails;
  }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message: string, errors: ErrorDetails = {}): ApiError {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors: ErrorDetails = {}): ApiError {
    return new ApiError({
      message: "unauthorized user",
      errors,
      status: 401,
    });
  }

  static notFound(errors: ErrorDetails = {}): ApiError {
    return new ApiError({
      message: "notFound",
      errors,
      status: 404,
    });
  }
}

export default ApiError;
