import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "devnote/modules/shared";
type Props = {
  note: { title: string }
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
};

export const DeleteNoteDialog = ({ note, isOpen, onClose, onConfirm }: Props) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="bg-gray-800 border-gray-600 text-green-400 font-mono max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-green-400 text-sm">:delete</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 text-xs">
            Delete <span className="text-green-300">{note.title}.md</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-transparent border-gray-600 text-gray-400 hover:text-gray-300 hover:bg-gray-700 text-xs font-mono"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-600 text-white text-xs font-mono border-0"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
