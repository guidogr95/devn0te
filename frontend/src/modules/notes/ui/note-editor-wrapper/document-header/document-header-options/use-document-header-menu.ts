import { useCallback } from "react";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { selectActiveNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { useSelector } from "react-redux";
import { createGenericDialog } from "devnote/modules/shared";
import { NoteEntity } from "devnote/modules/notes/core/entity/note.entity";
import { createShareNoteDialogContent } from "./create-share-note-dialog";


export function useDocumentHeaderMenu() {

	const activeNote = useSelector(selectActiveNote);

	const {
		handleDeleteNoteById
	} = useNotesActions();

	const { showToast, dismissToast } = useToastActions();

	const handleDeleteNote = useCallback((id: number) => {
		handleDeleteNoteById(id);
	}, [handleDeleteNoteById]);

	const onBeforeShare = useCallback((note: NoteEntity) => {
		showToast({
			type: "custom",
			jsx: (_id) => createGenericDialog({
				title: "Share note?",
				contentSlot: createShareNoteDialogContent({
					note,
					onCloseDialog: () => {
						dismissToast(_id);
					}
				}),
				okButtonLabel: "Share",
				hideCloseButton: false,
				hideOkButton: true,
				hideCancelButton: true,
				contentClassName: "max-w-96",
				onCancel: () => {
					dismissToast(_id);
				}
			}),
			data: {
				duration: Infinity
			}
		});
	}, [dismissToast, showToast]);

	const handleShareNote = useCallback(() => {
		if (!activeNote) return;
		onBeforeShare(activeNote);
	}, [activeNote, onBeforeShare]);

	return {
		activeNote,
		handleDeleteNote,
		handleShareNote
	};
};
