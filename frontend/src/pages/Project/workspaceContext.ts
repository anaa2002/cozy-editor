import { useOutletContext } from "react-router-dom";
import type { IProject } from "../../types/project.type";
import type { ChapterSummary } from "../../types/chapter.types";

export interface WorkspaceContext {
  project: IProject;
  chapters: ChapterSummary[];
  createNewChapter: () => Promise<void>;
  updateChapterSummary: (chapter: ChapterSummary) => void;
  openSidebar: () => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

export const useWorkspace = () => useOutletContext<WorkspaceContext>();
