import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { ProjectFormData } from "../../types/project.type";

interface ProjectFormProps {
  initialValues?: ProjectFormData;
  submitLabel: string;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

function ProjectForm({
  initialValues = { title: "", description: "" },
  submitLabel,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormData>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="project-form"
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <input
        className="project-form__title"
        type="text"
        placeholder="Title of your story"
        name="title"
        value={form.title}
        onChange={handleChange}
        maxLength={120}
        required
        autoFocus
      />
      <textarea
        placeholder="What is it about? (optional)"
        name="description"
        value={form.description}
        onChange={handleChange}
        maxLength={500}
        rows={3}
      />
      <div className="project-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
