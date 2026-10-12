import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

function sendErrorDev(err: ApiError, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorProd(err: ApiError, res: Response) {
  if (!err.isOperational) {
    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong." });
  }

  return res
    .status(err.statusCode)
    .json({ status: err.status, message: err.message });
}

function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError("Not found", 404);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
    return new ApiError(message, 400);
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 11000
  ) {
    const field = Object.keys(
      (err as { keyValue?: Record<string, unknown> }).keyValue ?? {},
    )[0];
    return new ApiError(
      field ? `That ${field} is already in use.` : "Already exists.",
      409,
    );
  }

  if (
    err instanceof Error &&
    "status" in err &&
    typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 500 &&
    "expose" in err &&
    err.expose === true
  ) {
    const isBadJson = "type" in err && err.type === "entity.parse.failed";
    return new ApiError(
      isBadJson ? "Request body is not valid JSON." : err.message,
      err.status,
    );
  }

  const unknownError = new ApiError(
    err instanceof Error ? err.message : "Something went wrong.",
    500,
    false,
  );
  if (err instanceof Error) unknownError.stack = err.stack;
  return unknownError;
}

export default function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // Express identifies error handlers by their four parameters.
  _next: NextFunction,
) {
  const apiError = normalizeError(err);
  if (!apiError.isOperational) console.error(err);

  if (env.isProd) return sendErrorProd(apiError, res);
  return sendErrorDev(apiError, res);
}
