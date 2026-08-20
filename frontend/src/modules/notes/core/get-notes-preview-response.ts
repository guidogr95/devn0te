import { ApiPaginatedResponse, PaginatedResponse } from "devnote/modules/shared/core/paginated-response.type";
import { NotePreviewEntity } from "./entity/note-preview.entity";

export type GetNotesPreviewReponse = ApiPaginatedResponse<NotePreviewResponse>;

export type NotePreviewResponse = {
	id: number
	title: string
	user_id: number
	created_at: string
	updated_at: string
	preview: string
}

export type PaginatedNotesPreviewValueObject = PaginatedResponse<NotePreviewEntity>
