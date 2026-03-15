<?php

namespace App\Notes\Application\DTOs;

use App\Notes\Domain\Enums\NoteSharingType;

class CreateNoteDTO
{
	public function __construct(
		public readonly int $userId,
		public readonly NoteSharingType $sharingType,
		public readonly string $title,
		public readonly ?string $content = null,
		public readonly ?string $searchableText = null,
		public readonly ?string $sharingPassword = null
	) {}
}