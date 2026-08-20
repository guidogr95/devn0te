import { ApiPaginatedResponse, PaginatedResponse } from "devnote/modules/shared/core/paginated-response.type";
import { NoteSharingTypeEnum } from "./enums/note-sharing-type.enum";
import { NoteEntity } from "./entity/note.entity";

export type GetNotesReponse = ApiPaginatedResponse<NoteResponse>;

export type NoteResponse = {
	id: number
	connector_id: string
	title: string
	content: string
	user_id: number
	created_at: string
	updated_at: string
	sharing_type: NoteSharingTypeEnum
	sharing_url: string | null
}

export type PaginatedNotesValueObject = PaginatedResponse<NoteEntity>
