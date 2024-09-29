<?php

namespace App\Domain\Notes\DTOs;

class UpdateNoteDTO
{
	public function __construct(
		public readonly ?string $title = null,
		public readonly ?string $content = null,
	) {}
}