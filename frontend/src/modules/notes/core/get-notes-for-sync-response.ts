export type SyncNoteResponse = {
	id: number
	title: string
	user_id: number
	updated_at: string
	content: string
}

export type GetNotesForSyncResponse = {
	notes: SyncNoteResponse[]
}
