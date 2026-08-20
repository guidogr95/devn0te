export type SyncNoteEntity = {
	id: number
	connectorId: string
	title: string
	userId: number
	updatedAt: string
	content: string
}

export type DeletedNoteResponse = {
	id: number
	note_id: number
	user_id: number
}

export type GetDeltaNotesValueObject = {
	notes: SyncNoteEntity[]
	deleted: string[]
}
