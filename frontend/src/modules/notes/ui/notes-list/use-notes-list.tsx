import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { selectIsLoadingNotes, selectNotesError, selectNotesList } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function useNotesList() {
	const {
		handleGetNotesList
	} = useNotesActions();
	const isLoadingNotes = useSelector(selectIsLoadingNotes);
	const notesList = useSelector(selectNotesList);
	const notesError = useSelector(selectNotesError);

	useEffect(() => {
		handleGetNotesList();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isLoadingNotes,
		notesList,
		notesError
	};
};
