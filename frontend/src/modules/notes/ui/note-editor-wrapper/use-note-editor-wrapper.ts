import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectActiveNote, selectActiveNoteError, selectActiveNoteId, selectIsLoadingActiveNote } from "../../redux/selector/notes-selectors";
import { useParams } from "@tanstack/react-router";
import { useNotesActions } from "../../hooks/use-notes-actions";

export function useNoteEditorWrapper() {

	const activeNote = useSelector(selectActiveNote);
	const activeNoteId = useSelector(selectActiveNoteId);
	const activeNoteError = useSelector(selectActiveNoteError);
	const isLoadingActiveNote = useSelector(selectIsLoadingActiveNote);

	const { handleGetNoteById } = useNotesActions();
	
  const id = useParams({
    select: (params) => params?.id ? parseInt(params.id) : undefined,
		strict: false
	});

	useEffect(() => {
		if (!id) return;
		if (activeNote?.id === id) return;

		if (
			!activeNote
			|| activeNote?.id !== activeNoteId
		) {
			handleGetNoteById(id);
			return;
		}
	}, [id, activeNoteId]);

	return {
		isLoadingActiveNote,
		activeNote,
		activeNoteError
	};
};
