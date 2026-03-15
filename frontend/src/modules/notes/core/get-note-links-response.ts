export type NoteLinkEntity = {
	id: number
	createdAt: string
	updatedAt: string
	sourceNoteId: number
	targetNoteId: number
}

export type GetNoteLinksResponse = NoteLinkEntity[]
