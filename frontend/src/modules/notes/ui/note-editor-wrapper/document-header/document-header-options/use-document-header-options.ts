import { selectActiveNote, selectIsChangesUnsavedMap, selectIsNoteUpdatingMap } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useDocumentHeaderOptions() {

	const activeNote = useSelector(selectActiveNote);
	const isChangesUnsavedMap = useSelector(selectIsChangesUnsavedMap);
	const isNoteUpdatingMap = useSelector(selectIsNoteUpdatingMap);

	const isChangesUnsaved = useMemo(() => {
		return activeNote
			? !!isChangesUnsavedMap?.[activeNote.id]
			: false;
	}, [activeNote, isChangesUnsavedMap]);

	const isNoteUpdating = useMemo(() => {
		return activeNote
			? !!isNoteUpdatingMap?.[activeNote.id]
			: false;
	}, [activeNote, isNoteUpdatingMap]);

	return {
		isChangesUnsaved,
		isNoteUpdating
	};
}
