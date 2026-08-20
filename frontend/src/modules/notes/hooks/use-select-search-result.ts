import { useCallback, useRef } from "react";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";

export function useSelectSearchResult() {
  const { handleSetActiveNoteId } = useNotesActions();
  const { toggleClose } = useActionDialogsActions();

  const handleSetActiveNoteIdRef = useRef(handleSetActiveNoteId);
  handleSetActiveNoteIdRef.current = handleSetActiveNoteId;

  const toggleCloseRef = useRef(toggleClose);
  toggleCloseRef.current = toggleClose;

  const handleSelectResult = useCallback((noteId: number) => {
    handleSetActiveNoteIdRef.current(noteId);
    toggleCloseRef.current("search");
  }, []);

  return { handleSelectResult };
}
