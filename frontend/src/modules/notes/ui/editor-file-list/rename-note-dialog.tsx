import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "devnote/modules/shared";
import { NotePreviewEntity } from "devnote/modules/notes/core/entity/note-preview.entity";
import { useRenameNoteDialog } from "./use-rename-note-dialog";

type Props = {
  note: NotePreviewEntity
  isOpen: boolean
  onClose: () => void
};

export const RenameNoteDialog = ({ note, isOpen, onClose }: Props) => {
  const {
    noteTitle,
    titleError,
    handleInputChange,
    handleRename,
    handleKeyDown,
    isPending,
  } = useRenameNoteDialog(note, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-gray-800 border-gray-600 text-green-400 font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-sm">:rename</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-400 mb-2">Enter new file name:</div>
            <Input
              value={noteTitle}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-gray-900 border-gray-600 text-green-400 font-mono text-sm focus:border-green-400"
              placeholder="my-note"
              autoFocus
            />
            {titleError && <div className="text-red-400 text-xs mt-1">{titleError}</div>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-700 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={isPending}
              onClick={handleRename}
              className="bg-green-700 hover:bg-green-600 text-gray-900 text-xs"
            >
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
