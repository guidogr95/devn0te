import { createLazyFileRoute } from "@tanstack/react-router";
import { MonacoNoteEditorWrapper } from "devnote/modules/notes/ui/note-editor-wrapper/monaco-editor";

export const Route = createLazyFileRoute("/dashboard/notes/$id")({
  component: () =>
		<MonacoNoteEditorWrapper />
});
