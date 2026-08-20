import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectActiveNote, selectActiveNoteError, selectIsLoadingActiveNote } from "../../redux/selector/notes-selectors";
import { useParams } from "@tanstack/react-router";
import { useNotesActions } from "../../hooks/use-notes-actions";

export function useNoteEditorWrapper() {

	const activeNote = useSelector(selectActiveNote);
	const activeNoteError = useSelector(selectActiveNoteError);
	const isLoadingActiveNote = useSelector(selectIsLoadingActiveNote);

	const { handleGetNoteById, handleGetLocalNotesList } = useNotesActions();
	
  const id = useParams({
    select: (params) => params?.id ? parseInt(params.id) : undefined,
		strict: false
	});

	useEffect(() => {
		if (!id) return;
		if (activeNote?.id === id) return;
		handleGetNoteById(id);
	}, [id]);

	useEffect(() => {
		setTimeout(() => {
			handleGetLocalNotesList();
		}, 500);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isLoadingActiveNote,
		activeNote,
		activeNoteError
	};
};
