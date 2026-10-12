import { Router } from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  signup,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  signupLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, getMe);

export default router;
