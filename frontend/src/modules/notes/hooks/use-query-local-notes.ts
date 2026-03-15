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


  const debouncedTriggerLocalQuery = useRef(
    debounce(searchTerm => {
      handleTriggerLocalQuery(searchTerm);
    }, 500)
  ).current;

  const handleQueryLocalNotes = useCallback((searchTerm: string) => {
    debouncedTriggerLocalQuery(searchTerm);
  }, [debouncedTriggerLocalQuery]);

  const handleSelectResult = useCallback((noteId: number) => {
  
    handleSetActiveNoteId(noteId);
    toggleClose("search");

  }, [handleSetActiveNoteId, toggleClose]);

	return {
    handleQueryLocalNotes,
    handleSelectResult
	};
}
