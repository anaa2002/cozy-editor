import { rateLimit } from "express-rate-limit";

// In-memory store: limits are per instance. Use a shared store when scaling out.

const tooMany = (message: string) => ({ status: "fail", message });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many login attempts. Please try again in 15 minutes."),
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many accounts created. Please try again later."),
});
