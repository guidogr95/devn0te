<?php

namespace App\Notes\Application\DTOs;

class UpdateNoteDTO
{
	public function __construct(
		public readonly ?string $title = null,
		public readonly ?string $content = null,
	) {}
}