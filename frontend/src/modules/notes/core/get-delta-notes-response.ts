export type SyncNoteResponse = {
	id: number
	title: string
	user_id: number
	updated_at: string
	content: string
}

export type DeletedNoteResponse = {
	id: number
	note_id: number
	user_id: number
}

export type GetDeltaNotesResponse = {
	notes: SyncNoteResponse[]
	deleted: string[]
}
