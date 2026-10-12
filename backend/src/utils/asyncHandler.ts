import type { NextFunction, Request, RequestHandler, Response } from "express";

export default function asyncHandler(fn: RequestHandler): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
