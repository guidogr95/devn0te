import { NoteEditorTitle } from "./note-editor-title";
// import { NoteEditorMenuBar } from "./note-editor-menu-bar";
import { SaveNoteArgs } from "devnote/modules/notes/hooks/types";

type Props = {
  titleRef: React.MutableRefObject<string | undefined>
  handleEditorChange: ({ id, title, content }: SaveNoteArgs) => void
}

export const NoteEditorHeader = ({
  titleRef,
  handleEditorChange
}: Props) => {

  return (
    <div className="flex flex-col">
      <NoteEditorTitle
        titleRef={titleRef}
        handleEditorChange={handleEditorChange}/>
      {/* <NoteEditorMenuBar/> */}
    </div>
  );
};
