import type { Request } from "express";
import Chapter, { NOTE_TYPES, type NoteType } from "../models/Chapter.js";
import Project from "../models/Project.js";
import asyncHandler from "../utils/asyncHandler.js";
import { errors } from "../utils/errors.js";

/*
getChapterById → GET    /api/projects/:projectId/chapters/:id
createChapter  → POST   /api/projects/:projectId/chapters
updateChapter  → PATCH  /api/projects/:projectId/chapters/:id
deleteChapter  → DELETE /api/projects/:projectId/chapters/:id
*/

async function findOwnedProject(req: Request) {
  const project = await Project.findOne({
    owner: req.user!._id,
    _id: req.params.projectId,
  });
  if (!project) throw errors.notFound();
  return project;
}

const isNoteType = (value: unknown): value is NoteType =>
  NOTE_TYPES.includes(value as NoteType);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function pickChapterFields(body: unknown) {
  const { title, content, notes } = (body ?? {}) as Record<string, unknown>;
  const update: {
    title?: string;
    content?: Record<string, unknown>;
    notes?: { _id?: string; text: string; type: NoteType }[];
  } = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim())
      throw errors.badRequest("Title can't be empty.");
    update.title = title;
  }
  if (content !== undefined) {
    if (!isPlainObject(content))
      throw errors.badRequest("Content must be a document.");
    update.content = content;
  }
  if (notes !== undefined) {
    if (!Array.isArray(notes) || notes.length > 100)
      throw errors.badRequest("Notes must be a list (max 100).");
    update.notes = notes.map((note) => {
      if (!isPlainObject(note) || typeof note.text !== "string")
        throw errors.badRequest("Every note needs text.");
      if (note.type !== undefined && !isNoteType(note.type))
        throw errors.badRequest(
          `Note type must be one of: ${NOTE_TYPES.join(", ")}.`,
        );
      return {
        ...(typeof note.id === "string" && { _id: note.id }),
        text: note.text,
        type: isNoteType(note.type) ? note.type : "scene",
      };
    });
  }
  return update;
}

export const getChapterById = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req);
  const chapter = await Chapter.findOne({
    project: project._id,
    _id: req.params.id,
  });
  if (!chapter) throw errors.notFound();

  res.status(200).json({ status: "success", data: { chapter } });
});

export const createChapter = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req);
  const fields = pickChapterFields(req.body);

  const last = await Chapter.findOne({ project: project._id })
    .sort({ pageNumber: -1 })
    .select("pageNumber");
  const pageNumber = (last?.pageNumber ?? 0) + 1;

  const chapter = await Chapter.create({
    title: `Chapter ${pageNumber}`,
    ...fields,
    project: project._id,
    pageNumber,
  });
  await project.updateOne({ updatedAt: new Date() });

  res.status(201).json({
    status: "success",
    message: "Chapter created successfully.",
    data: { chapter },
  });
});

export const updateChapter = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req);
  const chapter = await Chapter.findOneAndUpdate(
    { project: project._id, _id: req.params.id },
    pickChapterFields(req.body),
    { returnDocument: "after", runValidators: true },
  );
  if (!chapter) throw errors.notFound();
  await project.updateOne({ updatedAt: new Date() });

  res.status(200).json({
    status: "success",
    message: "Chapter updated successfully.",
    data: { chapter },
  });
});

export const deleteChapter = asyncHandler(async (req, res) => {
  const project = await findOwnedProject(req);
  const chapter = await Chapter.findOneAndDelete({
    project: project._id,
    _id: req.params.id,
  });
  if (!chapter) throw errors.notFound();

  res.status(200).json({
    status: "success",
    message: "Chapter deleted successfully.",
    data: { chapter },
  });
});
