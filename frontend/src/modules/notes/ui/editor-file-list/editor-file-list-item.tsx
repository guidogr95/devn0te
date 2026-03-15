import { File } from "lucide-react";

import { NotePreviewEntity } from "devnote/modules/notes/core/entity/note-preview.entity";
import { useFileListItem } from "./use-file-list-item";

type Props = {
  note: NotePreviewEntity;
};

export const EditorFileListItem = ({ note }: Props) => {
  const { isActive, handleSetNoteId } = useFileListItem(note);


  return (
    <div
      key={note.id}
      className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-700 transition-colors ${
        isActive
          ? "bg-gray-700 text-green-300"
          : "text-gray-400"
      }`}
      onClick={handleSetNoteId}
    >
      <File className="h-4 w-4" />

      <div className="line-clamp-1 text-sm">{note.title}.md</div>
    </div>
  );
};
