export type SyncNoteResponse = {
	id: number
	title: string
	user_id: number
	updated_at: string
	searchable_text: string
}

export type GetNotesForSyncResponse = {
	notes: SyncNoteResponse[]
}
