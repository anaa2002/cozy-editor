import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, FileText, LogOut, Plus, Trash2, X } from "lucide-react";
import type { IProject } from "../../types/project.type";
import type { ChapterSummary } from "../../types/chapter.types";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import Brand from "../Brand";

interface ChapterSidebarProps {
  project: IProject;
  chapters: ChapterSummary[];
  isCreating: boolean;
  onCreate: () => void;
  onDelete: (chapterId: string) => void;
  onClose: () => void;
}

function ChapterItem({
  projectId,
  chapter,
  onDelete,
  onNavigate,
}: {
  projectId: string;
  chapter: ChapterSummary;
  onDelete: (id: string) => void;
  onNavigate: () => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;
    const t = setTimeout(() => setIsConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [isConfirming]);

  return (
    <li className="chapter-item">
      <NavLink
        to={`/projects/${projectId}/chapters/${chapter.id}`}
        className="chapter-item__link"
        onClick={onNavigate}
      >
        <FileText size={15} aria-hidden />
        <span className="chapter-item__title">{chapter.title}</span>
      </NavLink>
      <button
        type="button"
        className={`icon-btn icon-btn--sm chapter-item__delete ${isConfirming ? "is-confirming" : ""}`}
        aria-label={
          isConfirming
            ? `Confirm delete ${chapter.title}`
            : `Delete ${chapter.title}`
        }
        title={isConfirming ? "Click again to delete" : "Delete chapter"}
        onClick={() =>
          isConfirming ? onDelete(chapter.id) : setIsConfirming(true)
        }
      >
        {isConfirming ? "Sure?" : <Trash2 size={14} />}
      </button>
    </li>
  );
}

function ChapterSidebar({
  project,
  chapters,
  isCreating,
  onCreate,
  onDelete,
  onClose,
}: ChapterSidebarProps) {
  const { user } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <aside className="sidebar" aria-label="Chapters">
      <div className="sidebar__top">
        <Brand />
        <button
          type="button"
          className="icon-btn sidebar__close"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <Link to="/projects" className="sidebar__back">
        <ArrowLeft size={14} aria-hidden /> Library
      </Link>

      <div className="sidebar__project">
        <h2>{project.title}</h2>
        {project.description && <p>{project.description}</p>}
      </div>

      <div className="sidebar__section-head">
        <span className="eyebrow">Manuscript</span>
        <button
          type="button"
          className="icon-btn icon-btn--sm"
          aria-label="New chapter"
          title="New chapter"
          onClick={onCreate}
          disabled={isCreating}
        >
          <Plus size={16} />
        </button>
      </div>

      <nav className="sidebar__chapters">
        {chapters.length === 0 ? (
          <p className="sidebar__empty">No chapters yet.</p>
        ) : (
          <ol>
            {chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                projectId={project.id}
                chapter={chapter}
                onDelete={onDelete}
                onNavigate={onClose}
              />
            ))}
          </ol>
        )}
      </nav>

      <div className="sidebar__footer">
        <span className="avatar" aria-hidden>
          {user?.username.charAt(0).toUpperCase()}
        </span>
        <span className="sidebar__username">{user?.username}</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Log out"
          title="Log out"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default ChapterSidebar;
