import { GetDeltaNotesValueObject } from "devnote/modules/notes/core/get-delta-notes-value-object";

export type SQLiteNotesDeltaPayload = GetDeltaNotesValueObject & {
	userId: number
}
