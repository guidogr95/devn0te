import { Input } from "devnote/modules/shared";
import { SaveNoteArgs } from "devnote/modules/notes/hooks/types";
import { useNoteEditorTitle } from "./use-note-editor-title";

type Props = {
  titleRef: React.MutableRefObject<string | undefined>
  handleEditorChange: ({ id, title, content }: SaveNoteArgs) => void
}

export const NoteEditorTitle = ({ titleRef, handleEditorChange }: Props) => {

  const {
    inputValue,
		handleInputChange
  } = useNoteEditorTitle({
    titleRef,
    handleEditorChange
  });

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg w-full">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter text here"
        aria-label="Text input"
        className="text-gray-100 focus:border-blue-500 bg-transparent border-none w-full text-md"
      />
    </div>
  );
};
