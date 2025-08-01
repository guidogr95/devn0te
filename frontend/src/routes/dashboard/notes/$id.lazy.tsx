import { createLazyFileRoute } from "@tanstack/react-router";
import { NoteEditorWrapper } from "devnote/modules/notes/ui";
import { MonacoNoteEditorWrapper } from "devnote/modules/notes/ui/note-editor-wrapper/monaco-editor";

export const Route = createLazyFileRoute("/dashboard/notes/$id")({
  component: () =>
		<MonacoNoteEditorWrapper />
});
