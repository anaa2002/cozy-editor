import ApiError from "./ApiError.js";

export const errors = {
  notFound: () => new ApiError("Not found", 404),
  fieldsMissing: () => new ApiError("Required fields are missing", 400),
  badRequest: (message: string) => new ApiError(message, 400),

  wrongCredentials: () => new ApiError("Wrong email or password", 401),
  unauthorized: () => new ApiError("Unauthorized", 401),
  sessionExpired: () => new ApiError("Session expired", 401),
  forbidden: () => new ApiError("Forbidden", 403),

  invalidToken: () => new ApiError("Invalid token", 401),
};
