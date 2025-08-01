import { SyncNoteEntity } from "../get-delta-notes-value-object";

export type LocalNoteEntity = SyncNoteEntity & {
	preview: string
}
