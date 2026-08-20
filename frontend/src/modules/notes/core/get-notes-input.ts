import { PaginatedInputValueObject } from "devnote/modules/shared/core/paginated-input";
import { SortDirection } from "./sort-options";


export type GetNotesSortByValues = "createdAt" | "updatedAt";

export type GetNotesInput = PaginatedInputValueObject & {
	sortBy?: GetNotesSortByValues
	sortDirection?: SortDirection
}
