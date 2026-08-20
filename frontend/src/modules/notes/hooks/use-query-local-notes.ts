import { useCallback, useRef } from "react";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { debounce } from "lodash-es";
import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";

export function useQueryLocalNotes() {

  const {
    handleTriggerLocalQuery,
    handleSetActiveNoteId,
  } = useNotesActions();

  const {
    toggleClose
  } = useActionDialogsActions();

  const handleTriggerLocalQueryRef = useRef(handleTriggerLocalQuery);
  handleTriggerLocalQueryRef.current = handleTriggerLocalQuery;

  const handleSetActiveNoteIdRef = useRef(handleSetActiveNoteId);
  handleSetActiveNoteIdRef.current = handleSetActiveNoteId;

  const toggleCloseRef = useRef(toggleClose);
  toggleCloseRef.current = toggleClose;

  const debouncedTriggerLocalQuery = useRef(
    debounce((searchTerm: string) => {
      handleTriggerLocalQueryRef.current(searchTerm);
    }, 500)
  ).current;

  const handleQueryLocalNotes = useCallback((searchTerm: string) => {
    debouncedTriggerLocalQuery(searchTerm);
  }, [debouncedTriggerLocalQuery]);

  const handleSelectResult = useCallback((noteId: number) => {
    handleSetActiveNoteIdRef.current(noteId);
    toggleCloseRef.current("search");
  }, []);

  return {
    handleQueryLocalNotes,
    handleSelectResult
  };
}
