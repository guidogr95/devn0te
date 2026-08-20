import { NoteSharingTypeEnum } from "../enums/note-sharing-type.enum";

export type NoteEntity = {
	id: number
	connectorId: string
	title: string
	content: string
	sharingType: NoteSharingTypeEnum
	sharingUrl: string | null
	userId: number
	createAt: string
	updatedAt: string
};
