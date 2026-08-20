import { useNoteUpdate } from "devnote/modules/notes/hooks/use-note-update";
import { useRef } from "react";

export function useNoteEditor() {

  const { handleEditorChange } = useNoteUpdate();

	const titleRef = useRef<string | undefined>(undefined);

	return {
		handleEditorChange,
		titleRef
	};
}
