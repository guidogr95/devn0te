import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { selectIsLoadingNotes, selectIsLoadingNotesNextPage, selectNotesError, selectNotesList } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function useNotesList() {
	const {
		handleGetNotesList,
		handleGetNotesListNextPage
	} = useNotesActions();
	const isLoadingNotes = useSelector(selectIsLoadingNotes);
	const isLoadingNotesNextPage = useSelector(selectIsLoadingNotesNextPage);
	const notesList = useSelector(selectNotesList);
	const notesError = useSelector(selectNotesError);

	useEffect(() => {
		handleGetNotesList({
			sortOptions: {
				value: "createdAt",
				direction: "desc"
			}
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		isLoadingNotes,
		notesList,
		notesError,
		handleGetNotesListNextPage,
		isLoadingNotesNextPage
	};
};
