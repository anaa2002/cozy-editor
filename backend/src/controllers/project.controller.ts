import Project from "../models/Project.js";
import Chapter from "../models/Chapter.js";
import asyncHandler from "../utils/asyncHandler.js";
import { errors } from "../utils/errors.js";

/*
getAllProjects → GET    /api/projects
getProjectById → GET    /api/projects/:id
createProject  → POST   /api/projects
updateProject  → PATCH  /api/projects/:id
deleteProject  → DELETE /api/projects/:id
*/

function pickProjectFields(body: unknown) {
  const { title, description } = (body ?? {}) as Record<string, unknown>;
  const update: { title?: string; description?: string } = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim())
      throw errors.badRequest("Title can't be empty.");
    update.title = title;
  }
  if (description !== undefined) {
    if (typeof description !== "string")
      throw errors.badRequest("Description must be text.");
    update.description = description;
  }
  return update;
}

export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user!._id }).sort({
    updatedAt: -1,
  });
  res.status(200).json({
    status: "success",
    results: projects.length,
    data: projects,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    owner: req.user!._id,
    _id: req.params.id,
  });
  if (!project) throw errors.notFound();

  const chapters = await Chapter.find({ project: project._id })
    .select("-content")
    .sort({ pageNumber: 1 });

  res.status(200).json({
    status: "success",
    data: { project, chapters, chapterCount: chapters.length },
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const fields = pickProjectFields(req.body);
  if (!fields.title) throw errors.fieldsMissing();

  const project = await Project.create({ ...fields, owner: req.user!._id });
  res.status(201).json({
    status: "success",
    message: "Project created successfully.",
    data: { project },
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { owner: req.user!._id, _id: req.params.id },
    pickProjectFields(req.body),
    { returnDocument: "after", runValidators: true },
  );
  if (!project) throw errors.notFound();

  res.status(200).json({
    status: "success",
    message: "Project updated successfully.",
    data: { project },
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({
    owner: req.user!._id,
    _id: req.params.id,
  });
  if (!project) throw errors.notFound();
  await Chapter.deleteMany({ project: project._id });

  res.status(200).json({
    status: "success",
    message: "Project and its chapters deleted successfully.",
    data: { project },
  });
});
