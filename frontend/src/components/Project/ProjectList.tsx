import type { IProject, ProjectFormData } from "../../types/project.type";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: IProject[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: ProjectFormData) => Promise<boolean>;
}

function ProjectList({ projects, onDelete, onUpdate }: ProjectListProps) {
  return (
    <ul className="book-grid">
      {projects.map((p) => (
        <li key={p.id}>
          <ProjectCard project={p} onDelete={onDelete} onUpdate={onUpdate} />
        </li>
      ))}
    </ul>
  );
}

export default ProjectList;
