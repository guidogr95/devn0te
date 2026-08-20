<?php

namespace App\Notes\Application\DTOs;

use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;

class UserNotesSortOptionsDTO
{
	public function __construct(
		public readonly ?UserNoteSortField $field = null,
		public readonly ?SortDirection $direction = null
	)
	{}

	/**
	 * @param array<string, int> $requestData
	 */
	public static function fromRequest(array $requestData): self
	{
		$field = isset($requestData['sort_by'])
			? UserNoteSortField::tryFrom($requestData['sort_by'])
			: null;

		$direction = isset($requestData['sort_direction'])
			? SortDirection::tryFrom($requestData['sort_direction'])
			: null;

		return new self($field, $direction);
	}

}