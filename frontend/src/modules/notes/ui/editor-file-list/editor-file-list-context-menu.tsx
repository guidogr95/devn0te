import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "devnote/modules/shared/ui/context-menu";
import { Trash2, Copy, Share2 } from "lucide-react";
// import { useEditorFileListContextMenu } from "./use-editor-file-list-context-menu";

type Props = {
	noteId: number | null
}

export const EditorFileListContextMenu = ({ noteId }: Props) => {
  // const { selectedNoteId, handleDelete, handleDuplicate, handleShare, handleCopy } =
  //   useEditorFileListContextMenu();

	console.log("noteId", noteId);

  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem onClick={() => console.log("hey")}>
        <Copy className="mr-2 h-4 w-4" />
        <span>Copy</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => console.log("hey")}>
        <Share2 className="mr-2 h-4 w-4" />
        <span>Share</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => console.log("hey")} className="text-red-400">
        <Trash2 className="mr-2 h-4 w-4" />
        <span>Delete</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
};
