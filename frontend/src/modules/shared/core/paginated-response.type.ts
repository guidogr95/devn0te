export type ApiPaginationResponse = {
	current_page: number
	last_page: number
	pages_left: number
	per_page: number
	total_items: number
}

export type ApiPaginatedResponse<T> = {
	status: "success"
	data: T[]
	pagination: ApiPaginationResponse
}

export type PaginationResponseValueObject = {
	currentPage: number
	lastPage: number
	pagesLeft: number
	perPage: number
	totalItems: number
}

export type PaginatedResponse<T> = {
	data: T[]
	pagination: PaginationResponseValueObject
}
