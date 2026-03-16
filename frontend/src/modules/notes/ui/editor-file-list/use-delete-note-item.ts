import { useCallback } from "react";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useToastActions } from "devnote/modules/shared/hooks/use-toast-actions";
import { createGenericDialog } from "devnote/modules/shared";

export function useDeleteNoteItem() {
  const { handleDeleteNoteById } = useNotesActions();
  const { showToast, dismissToast } = useToastActions();

  const handleDeleteClick = useCallback((noteId: number, noteTitle: string) => {
    showToast({
      type: "custom",
      jsx: (_id) => createGenericDialog({
        title: "Delete note?",
        description: `Delete ${noteTitle}.md? This action cannot be undone. This will permanently delete your note and remove it from our servers.`,
        onOk: () => {
          dismissToast(_id);
          handleDeleteNoteById(noteId);
        },
        onCancel: () => dismissToast(_id),
      }),
      data: { duration: Infinity },
    });
  }, [handleDeleteNoteById, showToast, dismissToast]);

  return { handleDeleteClick };
}
