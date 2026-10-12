import type { ChapterPatch, IChapter } from "../types/chapter.types";
import axiosInstance from "./axiosInstance";

const base = (projectId: string) => `/projects/${projectId}/chapters`;

function toServerPatch(patch: ChapterPatch) {
  if (!patch.notes) return patch;
  return {
    ...patch,
    notes: patch.notes.map(({ id, ...note }) =>
      id.startsWith("tmp-") ? note : { id, ...note },
    ),
  };
}

export const getChapter = async (
  projectId: string,
  chapterId: string,
): Promise<IChapter> => {
  const response = await axiosInstance.get(`${base(projectId)}/${chapterId}`);
  return response.data.data.chapter;
};

export const createChapter = async (
  projectId: string,
  data: ChapterPatch = {},
): Promise<IChapter> => {
  const response = await axiosInstance.post(
    base(projectId),
    toServerPatch(data),
  );
  return response.data.data.chapter;
};

export const updateChapter = async (
  projectId: string,
  chapterId: string,
  patch: ChapterPatch,
): Promise<IChapter> => {
  const response = await axiosInstance.patch(
    `${base(projectId)}/${chapterId}`,
    toServerPatch(patch),
  );
  return response.data.data.chapter;
};

export const deleteChapter = async (
  projectId: string,
  chapterId: string,
): Promise<void> => {
  await axiosInstance.delete(`${base(projectId)}/${chapterId}`);
};
