import type { JSONContent } from "@tiptap/react";

export type NoteType = "plot" | "scene" | "idea";

export interface INote {
  id: string;
  text: string;
  type: NoteType;
}

export interface IChapter {
  id: string;
  title: string;
  content: JSONContent;
  pageNumber: number;
  notes: INote[];
  createdAt: string;
  updatedAt: string;
}

export type ChapterSummary = Omit<IChapter, "content">;

export type ChapterPatch = Partial<
  Pick<IChapter, "title" | "content" | "notes">
>;
