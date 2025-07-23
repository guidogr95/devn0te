import { useParams } from "@tanstack/react-router";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";

export function useNoteItem(note: NoteEntity) {

  const id = useParams({
    select: (params) => params?.id,
		strict: false
	});

  const isActive = note.id.toString() === id;

	const { handleSetActiveNote } = useNotesActions();

	const handleSetNote = () => {
		handleSetActiveNote(note);
	};

	return {
		isActive,
		handleSetNote
	};
};
