import type { NextFunction, Request, Response } from "express";
import { errors } from "../utils/errors.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/authUtils/authCookies.js";
import User, { type IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) throw errors.unauthorized();

    let payload;
    try {
      payload = verifyAccessToken(authHeader.slice("Bearer ".length));
    } catch {
      throw errors.unauthorized();
    }

    const user = await User.findById(payload.userId);
    if (!user) throw errors.unauthorized();

    if (payload.iat === undefined || user.passwordChangedAfter(payload.iat))
      throw errors.unauthorized();

    req.user = user;
    next();
  },
);
