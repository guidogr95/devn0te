import { ApiPaginationResponse, PaginationResponseValueObject } from "../../core/paginated-response.type";

export class ApiMapper {

  static apiPaginationResponseToValueObject(input: ApiPaginationResponse): PaginationResponseValueObject {
		return {
			currentPage: input.current_page,
			lastPage: input.last_page,
			pagesLeft: input.pages_left,
			perPage: input.per_page,
			totalItems: input.total_items
		};
	}

}
