import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { updateChapter } from "../api/chapterApi";
import { getErrorMessage } from "../api/getErrorMessage";
import type { ChapterPatch, IChapter } from "../types/chapter.types";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

const AUTOSAVE_DELAY_MS = 1200;
const isEmpty = (patch: ChapterPatch) => Object.keys(patch).length === 0;

/** Debounced, serialized autosave for a single chapter. */
export function useChapterSaver(
  projectId: string,
  chapterId: string,
  onSaved?: (
    saved: IChapter,
    sentPatch: ChapterPatch,
    stillPending: ChapterPatch,
  ) => void,
) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const pending = useRef<ChapterPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chain = useRef<Promise<void>>(Promise.resolve());

  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  });

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    chain.current = chain.current.then(async () => {
      const patch = pending.current;
      if (isEmpty(patch)) return;
      pending.current = {};
      setStatus("saving");
      try {
        const saved = await updateChapter(projectId, chapterId, patch);
        onSavedRef.current?.(saved, patch, pending.current);
        setStatus(isEmpty(pending.current) ? "saved" : "unsaved");
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setStatus("saved");
          return;
        }
        pending.current = { ...patch, ...pending.current };
        setStatus("error");
        if (axios.isAxiosError(err) && err.response?.status === 401) return;
        toast.error(getErrorMessage(err, "Couldn't save your chapter."), {
          id: "autosave-error",
          description:
            "Your text is safe here. We'll retry on your next change.",
        });
      }
    });
    return chain.current;
  }, [projectId, chapterId]);

  const queue = useCallback(
    (patch: ChapterPatch, { immediate = false } = {}) => {
      pending.current = { ...pending.current, ...patch };
      setStatus("unsaved");
      clearTimeout(timer.current);
      if (immediate) void flush();
      else timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => () => void flush(), [flush]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isEmpty(pending.current)) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { status, queue, flush };
}
