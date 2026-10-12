import type { ChapterSummary } from "./chapter.types";

export interface IProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = Pick<IProject, "title" | "description">;

export interface IProjectDetail {
  project: IProject;
  chapters: ChapterSummary[];
  chapterCount: number;
}
