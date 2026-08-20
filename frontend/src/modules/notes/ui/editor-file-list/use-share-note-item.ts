import { useCallback } from "react";
import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { createGenericDialog } from "devnote/modules/shared";
import { NotesAdapter } from "devnote/modules/notes/interface/adapters/notes.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import { isGetNoteError } from "devnote/modules/notes/core/value-object/note-error-value-object";
import { createShareNoteDialogContent } from "devnote/modules/notes/ui/note-editor-wrapper/document-header/document-header-options/create-share-note-dialog";

export function useShareNoteItem() {
  const { showToast, dismissToast } = useToastActions();

  const handleShareClick = useCallback(async (noteId: number) => {
    const note = await NotesAdapter.getNoteById(noteId);

    if (isHttpError(note) || isGetNoteError(note)) return;

    showToast({
      type: "custom",
      jsx: (_id) => createGenericDialog({
        title: "Share note?",
        contentSlot: createShareNoteDialogContent({
          note,
          onCloseDialog: () => dismissToast(_id),
        }),
        hideOkButton: true,
        hideCancelButton: true,
        contentClassName: "max-w-96",
        onCancel: () => dismissToast(_id),
      }),
      data: {
        duration: Infinity,
      },
    });
  }, [showToast, dismissToast]);

  return { handleShareClick };
}
