<?php

namespace App\Domain\Notes\DTOs;

use App\Domain\Notes\Enums\NoteSharingType;

class ShareNoteDTO
{
	public function __construct(
		public readonly NoteSharingType $sharingType,
		public readonly ?string $sharingPassword = null
	) {}
}