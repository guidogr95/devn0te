import { NoteSharingTypeEnum } from "../enums/note-sharing-type.enum";

export type NoteEntity = {
	id: number
	title: string
	content: string
	sharingType: NoteSharingTypeEnum
	sharingPassword: null | string
	sharingUrl: string
	userId: number
	createAt: string
	updatedAt: string
};
