import { ShareNoteDlgContent } from "../../../share-note-dialog";
import { ShareNoteDialogProps } from "../../../share-note-dialog/types";

export const createShareNoteDialogContent = (props: ShareNoteDialogProps) => {
	return <ShareNoteDlgContent {...props} />;
};
