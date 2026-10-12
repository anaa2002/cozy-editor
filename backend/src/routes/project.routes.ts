import { Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import chapterRouter from "./chapter.routes.js";

const router = Router();

router.use(authMiddleware);

router.route("/").get(getAllProjects).post(createProject);
router
  .route("/:id")
  .get(getProjectById)
  .patch(updateProject)
  .delete(deleteProject);

router.use("/:projectId/chapters", chapterRouter);

export default router;
