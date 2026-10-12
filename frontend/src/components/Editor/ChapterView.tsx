import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import Typography from "@tiptap/extension-typography";
import {
  AlertCircle,
  Check,
  CloudUpload,
  Loader2,
  Maximize2,
  Menu,
  Minimize2,
  NotebookPen,
  PenLine,
} from "lucide-react";
import type { IChapter, INote } from "../../types/chapter.types";
import { useChapterSaver, type SaveStatus } from "../../hooks/useChapterSaver";
import { useWorkspace } from "../../pages/Project/workspaceContext";
import EditorToolbar from "./EditorToolbar";
import NotesPanel from "../Workspace/NotesPanel";

const STATUS_UI: Record<SaveStatus, { label: string; icon: typeof Check }> = {
  saved: { label: "Saved", icon: Check },
  unsaved: { label: "Unsaved", icon: PenLine },
  saving: { label: "Saving…", icon: Loader2 },
  error: { label: "Not saved — retry", icon: AlertCircle },
};

const hasDocument = (content: IChapter["content"]) => content?.type === "doc";

interface ChapterViewProps {
  projectId: string;
  chapter: IChapter;
}

function ChapterView({ projectId, chapter }: ChapterViewProps) {
  const { updateChapterSummary, openSidebar, isFocusMode, toggleFocusMode } =
    useWorkspace();
  const [title, setTitle] = useState(chapter.title);
  const [notes, setNotes] = useState<INote[]>(chapter.notes);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const lastSavedTitle = useRef(chapter.title);

  const { status, queue, flush } = useChapterSaver(
    projectId,
    chapter.id,
    (saved, sent, stillPending) => {
      lastSavedTitle.current = saved.title;
      const { content: _content, ...summary } = saved;
      updateChapterSummary(summary);
      if (sent.notes && !stillPending.notes) setNotes(saved.notes);
    },
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder: "Once upon a time…" }),
      CharacterCount,
      Typography,
    ],
    content: hasDocument(chapter.content) ? chapter.content : "",
    editorProps: {
      attributes: {
        class: "prose",
        spellcheck: "true",
        "aria-label": "Chapter text",
      },
    },
    onUpdate: ({ editor: e }) => queue({ content: e.getJSON() }),
  });

  const words = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.storage.characterCount.words() ?? 0,
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void flush();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flush]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (value.trim()) queue({ title: value.trim() });
  }

  function handleNotesChange(next: INote[]) {
    setNotes(next);
    queue({ notes: next }, { immediate: true });
  }

  const StatusIcon = STATUS_UI[status].icon;

  return (
    <div className="chapter-view" data-notes-open={isNotesOpen}>
      <section className="chapter-main">
        <header className="chapter-header">
          <div className="chapter-header__row">
            <button
              type="button"
              className="icon-btn workspace__menu"
              aria-label="Open chapters"
              onClick={openSidebar}
            >
              <Menu size={18} />
            </button>
            <input
              className="chapter-title"
              aria-label="Chapter title"
              value={title}
              maxLength={120}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => !title.trim() && setTitle(lastSavedTitle.current)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  editor?.commands.focus("start");
                }
              }}
            />
            <div className="chapter-header__actions">
              <button
                type="button"
                className="icon-btn"
                aria-pressed={isFocusMode}
                aria-label={isFocusMode ? "Exit focus mode" : "Focus mode"}
                title={isFocusMode ? "Exit focus mode" : "Focus mode"}
                onClick={toggleFocusMode}
              >
                {isFocusMode ? (
                  <Minimize2 size={17} />
                ) : (
                  <Maximize2 size={17} />
                )}
              </button>
              <button
                type="button"
                className="icon-btn chapter-header__notes-toggle"
                aria-pressed={isNotesOpen}
                aria-label="Toggle notes"
                title="Notes"
                onClick={() => setIsNotesOpen((v) => !v)}
              >
                <NotebookPen size={17} />
              </button>
            </div>
          </div>

          <div className="chips">
            <span className="chip chip--static">
              {words.toLocaleString()} {words === 1 ? "word" : "words"}
            </span>
            <span className="chip chip--static">
              ~{Math.max(1, Math.round(words / 230))} min read
            </span>
            <button
              type="button"
              className={`chip save-status save-status--${status}`}
              onClick={() => void flush()}
              title="Ctrl+S saves instantly"
              aria-live="polite"
            >
              <StatusIcon
                size={13}
                aria-hidden
                className={status === "saving" ? "spin" : undefined}
              />
              {STATUS_UI[status].label}
            </button>
            {status === "unsaved" && (
              <span className="chip chip--static chip--hint">
                <CloudUpload size={13} aria-hidden /> autosaving
              </span>
            )}
          </div>
        </header>

        <div className="manuscript">
          <div className="page-sheet">
            <EditorContent editor={editor} />
          </div>
        </div>

        {editor && <EditorToolbar editor={editor} />}
      </section>

      <NotesPanel
        notes={notes}
        onChange={handleNotesChange}
        onClose={() => setIsNotesOpen(false)}
      />
    </div>
  );
}

export default ChapterView;
