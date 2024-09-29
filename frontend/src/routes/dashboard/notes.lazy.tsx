import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import { NotesScreen } from "devnote/modules/dashboard/ui/notes-screen";

export const Route = createLazyFileRoute("/dashboard/notes")({
  component: () => 
		<NotesScreen>
			<Outlet />
		</NotesScreen>
});
