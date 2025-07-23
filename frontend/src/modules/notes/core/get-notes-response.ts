import { ApiPaginatedResponse, PaginatedResponse } from "devnote/modules/shared/core/paginated-response.type";
import { NoteSharingTypeEnum } from "./enums/note-sharing-type.enum";
import { NoteEntity } from "./entity/note.entity";

export type GetNotesReponse = ApiPaginatedResponse<NoteResponse>;

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

export type PaginatedNotesValueObject = PaginatedResponse<NoteEntity>
