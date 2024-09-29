<?php

namespace App\Domain\Notes\DTOs;

use App\Domain\Notes\Enums\NoteSharingType;

class CreateNoteDTO
{
	public function __construct(
		public readonly int $userId,
		public readonly NoteSharingType $sharingType,
		public readonly ?string $title = null,
		public readonly ?string $content = null,
		public readonly ?string $sharingPassword = null
	) {}
}