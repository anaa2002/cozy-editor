import { useState, type SubmitEvent } from "react";
import {
  Lightbulb,
  Clapperboard,
  Route,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { INote, NoteType } from "../../types/chapter.types";

const NOTE_TYPES: { value: NoteType; label: string; icon: LucideIcon }[] = [
  { value: "plot", label: "Plot", icon: Route },
  { value: "scene", label: "Scene", icon: Clapperboard },
  { value: "idea", label: "Idea", icon: Lightbulb },
];

const newTempId = () => `tmp-${crypto.randomUUID()}`;

interface NotesPanelProps {
  notes: INote[];
  onChange: (notes: INote[]) => void;
  onClose: () => void;
}

function NoteItem({
  note,
  onUpdate,
  onDelete,
}: {
  note: INote;
  onUpdate: (note: INote) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(note.text);
  const meta = NOTE_TYPES.find((t) => t.value === note.type) ?? NOTE_TYPES[1];
  const Icon = meta.icon;

  return (
    <li className={`note note--${note.type}`}>
      <div className="note__head">
        <span className="note__badge">
          <Icon size={13} aria-hidden /> {meta.label}
        </span>
        <select
          className="note__type"
          aria-label="Note type"
          value={note.type}
          onChange={(e) =>
            onUpdate({ ...note, type: e.target.value as NoteType })
          }
        >
          {NOTE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-btn icon-btn--sm icon-btn--danger"
          aria-label="Delete note"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <textarea
        className="note__text"
        aria-label="Note text"
        value={draft}
        rows={Math.min(8, Math.max(2, draft.split("\n").length))}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const text = draft.trim();
          if (!text) setDraft(note.text);
          else if (text !== note.text) onUpdate({ ...note, text });
        }}
      />
    </li>
  );
}

function NotesPanel({ notes, onChange, onClose }: NotesPanelProps) {
  const [text, setText] = useState("");
  const [type, setType] = useState<NoteType>("scene");
  const [filter, setFilter] = useState<NoteType | "all">("all");

  function addNote(e?: SubmitEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    onChange([{ id: newTempId(), text: text.trim(), type }, ...notes]);
    setText("");
  }

  const visible =
    filter === "all" ? notes : notes.filter((n) => n.type === filter);

  return (
    <aside className="notes-panel" aria-label="Chapter notes">
      <header className="panel-head">
        <span className="eyebrow">Notes</span>
        <span className="count-pill">{notes.length}</span>
        <button
          type="button"
          className="icon-btn icon-btn--sm notes-panel__close"
          aria-label="Close notes"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </header>

      <form className="note-composer" onSubmit={addNote}>
        <div className="segmented" role="radiogroup" aria-label="New note type">
          {NOTE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={type === t.value}
              className={`segmented__option segmented__option--${t.value}`}
              onClick={() => setType(t.value)}
            >
              <t.icon size={13} aria-hidden /> {t.label}
            </button>
          ))}
        </div>
        <textarea
          placeholder="A thought about this chapter… (Ctrl+Enter to add)"
          value={text}
          rows={3}
          maxLength={2000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addNote();
          }}
        />
        <button
          type="submit"
          className="btn btn--primary btn--sm btn--block"
          disabled={!text.trim()}
        >
          Add note
        </button>
      </form>

      {notes.length > 0 && (
        <div className="filter-chips" role="group" aria-label="Filter notes">
          {(["all", "plot", "scene", "idea"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="chip"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : NOTE_TYPES.find((t) => t.value === f)?.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="notes-panel__empty">
          {notes.length === 0
            ? "Plot twists, scene ideas, stray sparks: keep them here, next to the words."
            : "No notes of this type yet."}
        </p>
      ) : (
        <ul className="notes-list">
          {visible.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={(updated) =>
                onChange(notes.map((n) => (n.id === updated.id ? updated : n)))
              }
              onDelete={() => onChange(notes.filter((n) => n.id !== note.id))}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

export default NotesPanel;
