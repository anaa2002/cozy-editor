import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { IProject, ProjectFormData } from "../../types/project.type";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import ProjectForm from "./ProjectForm";

interface ProjectCardProps {
  project: IProject;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: ProjectFormData) => Promise<boolean>;
}

function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (isEditing) {
    return (
      <article className="book-card book-card--editing">
        <ProjectForm
          initialValues={{
            title: project.title,
            description: project.description ?? "",
          }}
          submitLabel="Save"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (data) => {
            if (await onUpdate(project.id, data)) setIsEditing(false);
          }}
        />
      </article>
    );
  }

  return (
    <article className="book-card">
      <Link to={`/projects/${project.id}`} className="book-card__link">
        <div className="book-card__spine" aria-hidden />
        <h2 className="book-card__title">{project.title}</h2>
        <p className="book-card__description">
          {project.description || <em>No description yet</em>}
        </p>
        <p className="book-card__meta">
          Edited {formatRelativeTime(project.updatedAt)}
        </p>
      </Link>

      <div className="book-card__actions">
        {isConfirmingDelete ? (
          <div className="confirm" role="group" aria-label="Confirm delete">
            <span>Delete forever?</span>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setIsConfirmingDelete(false)}
            >
              Keep
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Edit ${project.title}`}
              title="Edit"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              aria-label={`Delete ${project.title}`}
              title="Delete"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
