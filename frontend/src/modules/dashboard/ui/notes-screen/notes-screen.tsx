import { memo, PropsWithChildren, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectLocalNotesList } from "devnote/modules/notes/redux/selector/query-local-notes-selectors";
import { useNavigate } from "@tanstack/react-router";
import { Routes } from "devnote/config/routing/routing";
import { FileText } from "lucide-react";

const NoteRow = memo(({ note, onNavigate }: { note: { id: number; title: string; content: string; updatedAt: string }; onNavigate: (id: number) => void }) => {
	return (
		<div
			onClick={() => onNavigate(note.id)}
			className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
		>
			<FileText className="w-4 h-4 text-muted-foreground shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium truncate">{note.title}</p>
				<p className="text-xs text-muted-foreground truncate">{note.content.substring(0, 60) || "Empty note"}</p>
			</div>
			<span className="text-xs text-muted-foreground shrink-0">
				{new Date(note.updatedAt).toLocaleDateString()}
			</span>
		</div>
	);
});

const NotesList = () => {
	const localNotesList = useSelector(selectLocalNotesList);
	const navigate = useNavigate();

	const handleNavigate = useCallback((id: number) => {
		navigate({ to: Routes.dashboard.children.notes.params.getWithParams({ id }) });
	}, [navigate]);

	if (localNotesList.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
				<FileText className="w-8 h-8 mb-2 opacity-50" />
				<p className="text-sm">No notes yet</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 p-2">
			{localNotesList.map((note) => (
				<NoteRow key={note.id} note={note} onNavigate={handleNavigate} />
			))}
		</div>
	);
};

export const NotesScreen = ({ children }: PropsWithChildren) => {

	return (
		<div className="flex h-full w-full">
			<div className="block w-full h-full">
				<NotesList />
				{children}
			</div>
		</div>
	);
};
