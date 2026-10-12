import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { errors } from "./utils/errors.js";
import authRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";

const app = express();

// Required for correct client IPs (rate limiting) behind a reverse proxy.
if (env.isProd) app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "ok" });
});

app.all(/.*/, (req, res, next) => {
  next(errors.notFound());
});

app.use(errorMiddleware);
export default app;
