import { NoteSharingTypeEnum } from "./enums/note-sharing-type.enum"

export type GetNotesReponse = NoteResponse[]

export type NoteResponse = {
	id: number
	title: string
	content: string
	user_id: number
	created_at: string
	updated_at: string
	sharing_type: NoteSharingTypeEnum
	sharing_password: null | string
	sharing_url: string
}
