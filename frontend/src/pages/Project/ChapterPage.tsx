import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getChapter } from "../../api/chapterApi";
import { getErrorMessage } from "../../api/getErrorMessage";
import type { IChapter } from "../../types/chapter.types";
import FullPageLoader from "../../components/FullPageLoader";
import ChapterView from "../../components/Editor/ChapterView";
import { useWorkspace } from "./workspaceContext";

function ChapterPage() {
  const { chapterId } = useParams();
  const { project } = useWorkspace();
  const [loaded, setLoaded] = useState<{
    id: string;
    chapter?: IChapter;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;
    (async () => {
      try {
        const chapter = await getChapter(project.id, chapterId);
        if (!cancelled) setLoaded({ id: chapterId, chapter });
      } catch (err) {
        if (!cancelled)
          setLoaded({
            id: chapterId,
            error: getErrorMessage(err, "Couldn't open this chapter."),
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [project.id, chapterId]);

  if (!loaded || loaded.id !== chapterId)
    return <FullPageLoader label="Turning the page…" />;

  if (loaded.error || !loaded.chapter) {
    return (
      <div className="empty-state empty-state--page">
        <h2>This chapter slipped away</h2>
        <p>{loaded.error}</p>
        <Link to={`/projects/${project.id}`} className="btn btn--primary">
          Back to the manuscript
        </Link>
      </div>
    );
  }

  return (
    <ChapterView
      key={loaded.chapter.id}
      projectId={project.id}
      chapter={loaded.chapter}
    />
  );
}

export default ChapterPage;
