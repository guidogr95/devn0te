import { createLazyFileRoute } from "@tanstack/react-router";
import { NotesGraph } from "devnote/modules/nodes/ui/notes-graph/notes-graph";

export const Route = createLazyFileRoute("/dashboard/nodes/{-$id}")({
  component: () => <NotesGraph />
});
