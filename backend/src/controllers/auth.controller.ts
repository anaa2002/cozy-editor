import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { errors } from "../utils/errors.js";
import {
  clearAuthCookies,
  createSession,
  destroySession,
  rotateSession,
} from "../utils/authUtils/authCookies.js";
import User from "../models/User.js";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body ?? {};
  if (
    !isNonEmptyString(username) ||
    !isNonEmptyString(email) ||
    typeof password !== "string" ||
    !password
  )
    throw errors.fieldsMissing();

  const user = await User.create({ username, email, password });
  const { accessToken } = await createSession(res, user._id.toString());
  res.status(201).json({
    status: "success",
    message: "User created successfully.",
    accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!isNonEmptyString(email) || typeof password !== "string" || !password)
    throw errors.fieldsMissing();

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password",
  );
  // Identical error for unknown email and wrong password (prevents user enumeration).
  if (!user || !(await user.correctPassword(password)))
    throw errors.wrongCredentials();

  const oldSessionId = req.cookies?.sessionId;
  if (typeof oldSessionId === "string") await destroySession(oldSessionId);

  const { accessToken } = await createSession(res, user._id.toString());
  res.status(200).json({
    status: "success",
    message: "User logged in successfully.",
    accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.cookies?.sessionId;
  if (typeof sessionId === "string") await destroySession(sessionId);
  clearAuthCookies(res);
  res
    .status(200)
    .json({ status: "success", message: "User logged out successfully." });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.cookies?.sessionId;
  const refreshToken = req.cookies?.refreshToken;
  if (typeof sessionId !== "string" || typeof refreshToken !== "string")
    throw errors.sessionExpired();

  const { accessToken } = await rotateSession(res, sessionId, refreshToken);
  res.status(200).json({ status: "success", accessToken });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw errors.unauthorized();
  res.status(200).json({
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});
