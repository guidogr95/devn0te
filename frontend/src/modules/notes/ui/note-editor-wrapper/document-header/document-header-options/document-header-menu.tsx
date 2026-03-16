
import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "devnote/modules/shared";
import { MoreVertical } from "lucide-react";
import { useDocumentHeaderMenu } from "./use-document-header-menu";
import { DeleteNoteDialog } from "devnote/modules/notes/ui/editor-file-list/delete-note-dialog";

export const DocumentHeaderMenu = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const {
    activeNote,
    handleDeleteNote,
    handleShareNote
  } = useDocumentHeaderMenu();

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm bg-transparent text-gray-400 hover:bg-bg-primary hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
          >
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-56 bg-bg-primary text-gray-300">
          <DropdownMenuItem className="focus:bg-bg-secondary focus:text-gray-100">
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareNote} className="focus:bg-bg-secondary focus:text-gray-100">
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-bg-secondary" />
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="focus:bg-bg-secondary focus:text-gray-100">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {activeNote && (
        <DeleteNoteDialog
          note={activeNote}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => {
            handleDeleteNote(activeNote.id);
            setIsDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
};
