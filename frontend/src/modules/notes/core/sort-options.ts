export type SortDirection = "asc" | "desc";

export type SortOptions<T> = {
	value: T
	direction: SortDirection
}
