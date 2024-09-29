import { selectActiveNote, selectIsChangesUnsavedMap, selectIsNoteDeletingMap, selectIsNoteUpdatingMap } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export function useDocumentChangesState() {

	const activeNote = useSelector(selectActiveNote);
	const isChangesUnsavedMap = useSelector(selectIsChangesUnsavedMap);
	const isNoteUpdatingMap = useSelector(selectIsNoteUpdatingMap);
	const isNoteDeletingMap = useSelector(selectIsNoteDeletingMap);

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

	const isNoteDeleting = useMemo(() => {
		return activeNote
			? !!isNoteDeletingMap?.[activeNote.id]
			: false;
	}, [activeNote, isNoteDeletingMap]);

	return {
		isChangesUnsaved,
		isNoteUpdating,
		isNoteDeleting
	};
}
