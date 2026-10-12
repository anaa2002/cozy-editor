import { Navigate } from "react-router-dom";
import { Feather, Menu, Plus } from "lucide-react";
import { useWorkspace } from "./workspaceContext";

function WorkspaceIndex() {
  const { project, chapters, createNewChapter, openSidebar } = useWorkspace();

  const first = chapters[0];
  if (first)
    return (
      <Navigate to={`/projects/${project.id}/chapters/${first.id}`} replace />
    );

  return (
    <div className="empty-state empty-state--page">
      <button
        type="button"
        className="icon-btn workspace__menu"
        aria-label="Open chapters"
        onClick={openSidebar}
      >
        <Menu size={18} />
      </button>
      <Feather size={40} aria-hidden />
      <h2>The first page is waiting</h2>
      <p>“{project.title}” has no chapters yet.</p>
      <button
        type="button"
        className="btn btn--primary"
        onClick={createNewChapter}
      >
        <Plus size={18} aria-hidden /> Write chapter one
      </button>
    </div>
  );
}

export default WorkspaceIndex;
