import { useCallback, useRef } from "react";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { debounce } from "lodash-es";
import { SaveNoteArgs } from "./types";

export function useNoteUpdate() {

  const {
    handleUpdateNoteById,
    handleCancelUpdateRequest,
    handleRegisterIsChangesUnsaved
  } = useNotesActions();

  const handleChangesRegistered = useCallback((id: number) => {
    handleRegisterIsChangesUnsaved(id, true);
    handleCancelUpdateRequest(id);
  }, [handleCancelUpdateRequest, handleRegisterIsChangesUnsaved]);

  const debouncedSaveNote = useRef(
    debounce(({ title, content, id }: SaveNoteArgs) => {
      handleUpdateNoteById({
        id,
        title,
        content,
      });
    }, 2000)
  ).current;

	const handleEditorChange = useCallback(({ id, title, content }: SaveNoteArgs) => {
    handleChangesRegistered(id);
    debouncedSaveNote({
			title,
			content,
			id
		});
  }, [debouncedSaveNote, handleChangesRegistered]);

	return {
		handleEditorChange
	};
}
