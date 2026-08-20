export type NoteLinkEntity = {
	id: number
	createdAt: string
	updatedAt: string
	sourceConnectorId: string
	targetConnectorId: string | null
}

export type GetNoteLinksResponse = NoteLinkEntity[]
