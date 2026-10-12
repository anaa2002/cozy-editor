import { useState, type SubmitEvent } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SeparatorHorizontal,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";

interface ToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon: Icon,
  label,
  shortcut,
  isActive,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="toolbar__btn"
      aria-label={label}
      aria-pressed={isActive}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      // Keep the editor selection when clicking toolbar buttons.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon size={17} />
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const run = () => editor.chain().focus();

  function openLink() {
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setIsLinkOpen(true);
  }

  function applyLink(e: SubmitEvent) {
    e.preventDefault();
    const url = linkUrl.trim();
    if (!url) {
      run().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
      run().extendMarkRange("link").setLink({ href }).run();
    }
    setIsLinkOpen(false);
  }

  return (
    <div className="toolbar-wrap">
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        <ToolbarButton
          icon={Undo2}
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={!state.canUndo}
          onClick={() => run().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={!state.canRedo}
          onClick={() => run().redo().run()}
        />
        <span className="toolbar__divider" />
        <ToolbarButton
          icon={Bold}
          label="Bold"
          shortcut="Ctrl+B"
          isActive={state.bold}
          onClick={() => run().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          shortcut="Ctrl+I"
          isActive={state.italic}
          onClick={() => run().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Underline}
          label="Underline"
          shortcut="Ctrl+U"
          isActive={state.underline}
          onClick={() => run().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          isActive={state.strike}
          onClick={() => run().toggleStrike().run()}
        />
        <span className="toolbar__divider" />
        <ToolbarButton
          icon={Heading1}
          label="Heading 1"
          isActive={state.h1}
          onClick={() => run().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          isActive={state.h2}
          onClick={() => run().toggleHeading({ level: 2 }).run()}
        />
        <span className="toolbar__divider" />
        <ToolbarButton
          icon={List}
          label="Bullet list"
          isActive={state.bulletList}
          onClick={() => run().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          isActive={state.orderedList}
          onClick={() => run().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Quote"
          isActive={state.blockquote}
          onClick={() => run().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={SeparatorHorizontal}
          label="Scene break"
          onClick={() => run().setHorizontalRule().run()}
        />
        <ToolbarButton
          icon={Link2}
          label="Link"
          isActive={state.link}
          onClick={openLink}
        />
      </div>

      {isLinkOpen && (
        <form className="toolbar__link" onSubmit={applyLink}>
          <input
            type="text"
            inputMode="url"
            placeholder="Paste a link… (empty = remove)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsLinkOpen(false);
                editor.commands.focus();
              }
            }}
            autoFocus
          />
          <button type="submit" className="btn btn--primary btn--sm">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}

export default EditorToolbar;
