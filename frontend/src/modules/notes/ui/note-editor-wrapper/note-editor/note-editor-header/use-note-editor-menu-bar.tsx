import { useMemo } from "react";
import { useCurrentEditor } from "@tiptap/react";
import { Divider, MenuBarItem } from "../types";

export function useNoteEditorMenuBar() {

	const { editor } = useCurrentEditor();
	
  const items: (Divider | MenuBarItem)[] = useMemo(() => ([
    {
      icon: "Bold",
      title: "Bold",
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive("bold"),
    },
    {
      icon: "Italic",
      title: "Italic",
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive("italic"),
    },
    {
      icon: "Strikethrough",
      title: "Strike",
      action: () => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editor?.isActive("strike"),
    },
    {
      icon: "SquareChevronRight",
      title: "Code",
      action: () => editor?.chain().focus().toggleCode().run(),
      isActive: () => editor?.isActive("code"),
    },
    {
      icon: "Highlighter",
      title: "Highlight",
      action: () => editor?.chain().focus().toggleHighlight().run(),
      isActive: () => editor?.isActive("highlight"),
    },
    {
      type: "divider",
    },
    {
      icon: "Heading1",
      title: "Heading 1",
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive("heading", { level: 1 }),
    },
    {
      icon: "Heading2",
      title: "Heading 2",
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive("heading", { level: 2 }),
    },
    {
      icon: "Pilcrow",
      title: "Paragraph",
      action: () => editor?.chain().focus().setParagraph().run(),
      isActive: () => editor?.isActive("paragraph"),
    },
    {
      icon: "List",
      title: "Bullet List",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive("bulletList"),
    },
    {
      icon: "ListOrdered",
      title: "Ordered List",
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive("orderedList"),
    },
    {
      icon: "ListChecks",
      title: "Task List",
      action: () => editor?.chain().focus().toggleTaskList().run(),
      isActive: () => editor?.isActive("taskList"),
    },
    {
      icon: "Code",
      title: "Code Block",
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive("codeBlock"),
    },
    {
      type: "divider",
    },
    {
      icon: "TextQuote",
      title: "Blockquote",
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive("blockquote"),
    },
    {
      icon: "SeparatorHorizontal",
      title: "Horizontal Rule",
      action: () => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
      type: "divider",
    },
    {
      icon: "WrapText",
      title: "Hard Break",
      action: () => editor?.chain().focus().setHardBreak().run(),
    },
    {
      icon: "RemoveFormatting",
      title: "Clear Format",
      action: () => editor?.chain().focus().clearNodes().unsetAllMarks()
        .run(),
    },
    {
      type: "divider",
    },
    {
      icon: "SquarePen",
      title: "Draw",
      action: () => editor?.chain().focus().insertContent([{ type: "canvasNode" }]).run()
    },
    {
      type: "divider",
    },
    {
      icon: "Undo2",
      title: "Undo",
      action: () => editor?.chain().focus().undo().run(),
    },
    {
      icon: "Redo2",
      title: "Redo",
      action: () => editor?.chain().focus().redo().run(),
    },
  ]), [editor]);

	return {
		items
	};
};
