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
}: Props) {

	const activeNote = useSelector(selectActiveNote);
  const [inputValue, setInputValue] = useState(activeNote?.title || "");

	useEffect(() => {
    if (!activeNote?.id) return;

    handleUpdateInputValue(activeNote?.title || "");
  }, [activeNote?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateInputValue(e.target.value);
    
    if (!activeNote) return;
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
