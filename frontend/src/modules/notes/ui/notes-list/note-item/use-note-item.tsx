import { useNavigate, useParams } from "@tanstack/react-router";
import { Routes } from "devnote/config/routing/routing";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";

export function useNoteItem(note: NoteEntity) {
	const navigate = useNavigate();

  const id = useParams({
    select: (params) => params?.id,
		strict: false
	});

  const isActive = note.id.toString() === id;

	const { handleSetActiveNote } = useNotesActions();

	const handleSetNote = () => {
		handleSetActiveNote(note);
		navigate({ to: Routes.dashboard.children.notes.params.getWithParams({ id: note.id }),  });
	};

	return {
		isActive,
		handleSetNote
	};
};
