import { MonacoNoteEditor } from "./monaco-note-editor";
import { useNoteEditorWrapper } from "../use-note-editor-wrapper";
import { AppLoader } from "devnote/modules/shared/ui/app-loader/app-loader";
import { GetNoteErrorTypesEnum } from "devnote/modules/notes/errors/get-note-error-types.enum";
import { NoteEditorEmpty } from "../note-editor-empty";

export function MonacoNoteEditorWrapper() {
  const { isLoadingActiveNote, activeNote, activeNoteError } =
    useNoteEditorWrapper();

  if (isLoadingActiveNote) {
    return (
      <div className="w-full bg-gray-900">
        <AppLoader />
      </div>
    );
  }

  if (activeNoteError) {
    switch (activeNoteError.type) {
      case GetNoteErrorTypesEnum.NOTE_NOT_FOUND:
        return <h3>No note matching query</h3>;
      default:
        return <h3>Unknown error fetching note</h3>;
    }
  }

  if (!activeNote) {
    return <NoteEditorEmpty />;
  }

  return <MonacoNoteEditor note={activeNote} />;
}
