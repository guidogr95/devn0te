<?php

namespace App\Notes\Application\DTOs;

use App\Notes\Domain\Enums\NoteSharingType;

class ShareNoteDTO
{
	public function __construct(
		public readonly NoteSharingType $sharingType,
		public readonly ?string $sharingPassword = null
	) {}
}