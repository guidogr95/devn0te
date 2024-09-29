import { createLazyFileRoute } from "@tanstack/react-router";
import { NoteEditorWrapper } from "devnote/modules/notes/ui";

export const Route = createLazyFileRoute("/dashboard/notes/$id")({
  component: () => 
		<NoteEditorWrapper />
});
