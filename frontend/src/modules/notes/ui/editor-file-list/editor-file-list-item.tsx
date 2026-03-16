import { useState } from "react";
import { File } from "lucide-react";
import { ContextMenu, ContextMenuTrigger } from "devnote/modules/shared";
import { NotePreviewEntity } from "devnote/modules/notes/core/entity/note-preview.entity";
import { useNotesActions } from "devnote/modules/notes/hooks/use-notes-actions";
import { useFileListItem } from "./use-file-list-item";
import { EditorFileListContextMenu } from "./editor-file-list-context-menu";
import { RenameNoteDialog } from "./rename-note-dialog";
import { DeleteNoteDialog } from "./delete-note-dialog";
import { useShareNoteItem } from "./use-share-note-item";

type Props = {
  note: NotePreviewEntity;
};

export const EditorFileListItem = ({ note }: Props) => {
  const { isActive, handleSetNoteId } = useFileListItem(note);
  const { handleDeleteNoteById } = useNotesActions();
  const { handleShareClick } = useShareNoteItem();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
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
        </ContextMenuTrigger>
        <EditorFileListContextMenu
          noteId={note.id}
          onRenameClick={() => setIsRenameOpen(true)}
          onDeleteClick={() => setIsDeleteOpen(true)}
          onShareClick={() => handleShareClick(note.id)}
        />
      </ContextMenu>
      {isRenameOpen && (
        <RenameNoteDialog
          note={note}
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
        />
      )}
      <DeleteNoteDialog
        note={note}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeleteNoteById(note.id);
          setIsDeleteOpen(false);
        }}
      />
    </>
  );
};
