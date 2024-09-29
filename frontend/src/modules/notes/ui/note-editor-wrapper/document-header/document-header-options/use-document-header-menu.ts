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

	const onBeforeDelete = useCallback((id: number) => {
		showToast({
			type: "custom",
			jsx: (_id) => createGenericDialog({
				title: "Delete note?",
				description: "This action cannot be undone. This will permanently delete your note and remove it from our servers.",
				onOk: () => {
					dismissToast(_id);
					handleDeleteNoteById(id);
				},
				onCancel: () => {
					dismissToast(_id);
				}
			}),
			data: {
				duration: Infinity
			}
		});
	}, [handleDeleteNoteById, showToast, dismissToast]);

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

	const handleDeleteNote = useCallback(() => {
		if (!activeNote) return;
		onBeforeDelete(activeNote.id);
	}, [activeNote, onBeforeDelete]);

	const handleShareNote = useCallback(() => {
		if (!activeNote) return;
		onBeforeShare(activeNote);
	}, [activeNote, onBeforeShare]);

	return {
		handleDeleteNote,
		handleShareNote
	};
};
