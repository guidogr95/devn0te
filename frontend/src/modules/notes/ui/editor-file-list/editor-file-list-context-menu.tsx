import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "devnote/modules/shared/ui/context-menu";
import { Trash2, Share2, Pencil } from "lucide-react";

type Props = {
  onRenameClick: () => void
  onDeleteClick: () => void
  onShareClick: () => void
};

export const EditorFileListContextMenu = ({ onRenameClick, onDeleteClick, onShareClick }: Props) => {
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem onClick={onRenameClick}>
        <Pencil className="mr-2 h-4 w-4" />
        <span>Rename</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onShareClick}>
        <Share2 className="mr-2 h-4 w-4" />
        <span>Share</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onDeleteClick} className="text-red-400">
        <Trash2 className="mr-2 h-4 w-4" />
        <span>Delete</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
};
