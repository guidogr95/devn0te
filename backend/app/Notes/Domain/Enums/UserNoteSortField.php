<?php

namespace App\Notes\Domain\Enums;

enum UserNoteSortField: string
{
	case CreatedAt = 'created_at';
	case UpdatedAt = 'updated_at';
}

enum SortDirection: string
{
	case Ascending = 'asc';
	case Descending = 'desc';
}
