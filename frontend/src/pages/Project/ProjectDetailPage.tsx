import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { getProjectById } from "../../api/projectApi";
import { createChapter, deleteChapter } from "../../api/chapterApi";
import { getErrorMessage } from "../../api/getErrorMessage";
import type { IProject } from "../../types/project.type";
import type { ChapterSummary } from "../../types/chapter.types";
import ChapterSidebar from "../../components/Workspace/ChapterSidebar";
import FullPageLoader from "../../components/FullPageLoader";
import type { WorkspaceContext } from "./workspaceContext";

function ProjectDetailPage() {
  const { id: projectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<IProject | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await getProjectById(projectId);
        if (cancelled) return;
        setProject(detail.project);
        setChapters(detail.chapters);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          axios.isAxiosError(err) && err.response?.status === 404
            ? "This project doesn't exist (or isn't yours)."
            : getErrorMessage(err, "Couldn't open this project."),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createNewChapter = useCallback(async () => {
    if (!projectId) return;
    setIsCreating(true);
    try {
      const chapter = await createChapter(projectId);
      setChapters((prev) => [...prev, chapter]);
      navigate(`/projects/${projectId}/chapters/${chapter.id}`);
      setIsSidebarOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create a chapter."));
    } finally {
      setIsCreating(false);
    }
  }, [projectId, navigate]);

  const handleDeleteChapter = useCallback(
    async (id: string) => {
      if (!projectId) return;
      const previous = chapters;
      setChapters((prev) => prev.filter((c) => c.id !== id));
      if (id === chapterId)
        navigate(`/projects/${projectId}`, { replace: true });
      try {
        await deleteChapter(projectId, id);
        toast.success("Chapter deleted");
      } catch (err) {
        setChapters(previous);
        toast.error(getErrorMessage(err, "Couldn't delete the chapter."));
      }
    },
    [projectId, chapterId, chapters, navigate],
  );

  const updateChapterSummary = useCallback((updated: ChapterSummary) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
    );
  }, []);

  if (loadError) {
    return (
      <div className="empty-state empty-state--page">
        <h2>Hmm, we lost the page</h2>
        <p>{loadError}</p>
        <Link to="/projects" className="btn btn--primary">
          Back to library
        </Link>
      </div>
    );
  }
  if (!project) return <FullPageLoader label="Opening your manuscript…" />;

  const context: WorkspaceContext = {
    project,
    chapters,
    createNewChapter,
    updateChapterSummary,
    openSidebar: () => setIsSidebarOpen(true),
    isFocusMode,
    toggleFocusMode: () => setIsFocusMode((v) => !v),
  };

  return (
    <div
      className="workspace"
      data-sidebar-open={isSidebarOpen}
      data-focus-mode={isFocusMode}
    >
      <ChapterSidebar
        project={project}
        chapters={chapters}
        isCreating={isCreating}
        onCreate={createNewChapter}
        onDelete={handleDeleteChapter}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div
        className="workspace__scrim"
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden
      />
      <div className="workspace__main">
        <Outlet context={context} />
      </div>
    </div>
  );
}

export default ProjectDetailPage;
