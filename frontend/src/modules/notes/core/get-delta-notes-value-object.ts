export type SyncNoteEntity = {
	id: number
	title: string
	userId: number
	updatedAt: string
	searchableText: string
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
