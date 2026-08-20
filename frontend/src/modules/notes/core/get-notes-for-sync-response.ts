export type SyncNoteResponse = {
	id: number
	connector_id: string
	title: string
	user_id: number
	updated_at: string
	content: string
}

export type GetNotesForSyncResponse = {
	notes: SyncNoteResponse[]
}
