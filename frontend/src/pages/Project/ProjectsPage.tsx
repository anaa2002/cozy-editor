import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import type { IProject, ProjectFormData } from "../../types/project.type";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
} from "../../api/projectApi";
import { getErrorMessage } from "../../api/getErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import AppHeader from "../../components/AppHeader";
import ProjectList from "../../components/Project/ProjectList";
import ProjectForm from "../../components/Project/ProjectForm";

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await getAllProjects();
        if (!cancelled) setProjects(p);
      } catch (err) {
        if (!cancelled)
          toast.error(getErrorMessage(err, "Couldn't load your projects."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateProject(projectData: ProjectFormData) {
    try {
      const createdProject = await createProject(projectData);
      setProjects((prev) => [createdProject, ...prev]);
      setIsCreating(false);
      toast.success(`“${createdProject.title}” is ready for its first words`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create the project."));
    }
  }

  async function handleDeleteProject(id: string) {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the project."));
    }
  }

  async function handleProjectUpdate(id: string, projectForm: ProjectFormData) {
    try {
      const updatedProject = await updateProject(id, projectForm);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p)),
      );
      toast.success("Changes saved");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save your changes."));
      return false;
    }
  }

  return (
    <div className="page">
      <AppHeader />
      <main className="library">
        <header className="library__hero">
          <div>
            <p className="eyebrow">Your library</p>
            <h1>Good to see you, {user?.username}.</h1>
            <p className="library__subtitle">
              {isLoading
                ? "Gathering your stories…"
                : projects.length === 1
                  ? "1 story waiting for you."
                  : `${projects.length} stories waiting for you.`}
            </p>
          </div>
          {!isCreating && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setIsCreating(true)}
            >
              <Plus size={18} aria-hidden /> New project
            </button>
          )}
        </header>

        {isCreating && (
          <div className="card library__create">
            <ProjectForm
              submitLabel="Create project"
              onSubmit={handleCreateProject}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        )}

        {isLoading ? (
          <ul className="book-grid" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li key={i} className="book-card book-card--skeleton" />
            ))}
          </ul>
        ) : projects.length > 0 ? (
          <ProjectList
            projects={projects}
            onDelete={handleDeleteProject}
            onUpdate={handleProjectUpdate}
          />
        ) : (
          !isCreating && (
            <div className="empty-state">
              <BookOpen size={40} aria-hidden />
              <h2>Every story starts with a blank page</h2>
              <p>Create your first project and give your ideas a home.</p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setIsCreating(true)}
              >
                <Plus size={18} aria-hidden /> Start a story
              </button>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default ProjectsPage;
