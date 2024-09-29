import { useCurrentEditor } from "@tiptap/react";
import { SaveNoteArgs } from "devnote/modules/notes/hooks/types";
import { selectActiveNote } from "devnote/modules/notes/redux/selector/notes-selectors";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Props = {
	titleRef: React.MutableRefObject<string | undefined>
  handleEditorChange: ({ id, title, content }: SaveNoteArgs) => void
}

export function useNoteEditorTitle({
	titleRef,
	handleEditorChange
}: Props) {

	const activeNote = useSelector(selectActiveNote);
  const [inputValue, setInputValue] = useState(activeNote?.title || "");
  const { editor } = useCurrentEditor();

	useEffect(() => {
    if (!activeNote?.id) return;

    handleUpdateInputValue(activeNote?.title || "");
  }, [activeNote?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateInputValue(e.target.value);
    
    if (!activeNote) return;
    
    handleEditorChange({
      id: activeNote.id,
      title: e.target.value,
      content: editor?.getHTML()
    });
  };

  const handleUpdateInputValue = (value: string) => {
    setInputValue(value);
    titleRef.current = value;
  };

	return {
		inputValue,
		handleInputChange
	};

}
