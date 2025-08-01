<?php

namespace App\Notes\Application\DTOs;

class CreateDeletedNoteDTO
{
	public function __construct(
		public readonly int $noteId,
		public readonly int $userId
	) {}
}