import { PaginatedDTO } from "devnote/modules/shared/core/paginated-dto";
import { SortDirection } from "./sort-options";

export type GetNotesSortByDTOValues = "created_at" | "updated_at";

export type GetNotesDTO = PaginatedDTO & {
	sort_by?: GetNotesSortByDTOValues
	sort_direction?: SortDirection
}
