import { useParams } from "@tanstack/react-router";
import { NotePreviewEntity } from "devnote/modules/notes/core/entity/note-preview.entity";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";

export function useFileListItem(note: NotePreviewEntity) {

  const id = useParams({
    select: (params) => params?.id,
		strict: false
	});

  const isActive = note.id.toString() === id;

	const { handleSetActiveNoteId } = useNotesActions();

	const handleSetNoteId = () => {
		handleSetActiveNoteId(note.id);
	};

	return {
		isActive,
		handleSetNoteId
	};
};
