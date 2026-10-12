import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createChapter,
  deleteChapter,
  getChapterById,
  updateChapter,
} from "../controllers/chapter.controller.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router
  .route("/:id")
  .get(getChapterById)
  .patch(updateChapter)
  .delete(deleteChapter);

router.post("/", createChapter);

export default router;
