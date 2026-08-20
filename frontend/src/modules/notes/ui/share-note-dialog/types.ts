import { NoteEntity } from "../../core/entity/note.entity";

export type ShareNoteDialogProps = {
	note: NoteEntity
	onCloseDialog: () => void
	onUnshare?: () => void
}
