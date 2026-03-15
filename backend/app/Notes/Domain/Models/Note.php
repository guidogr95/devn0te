<?php

namespace App\Notes\Domain\Models;

use App\Notes\Domain\Enums\NoteSharingType;

class Note
{
	public function __construct(
		public readonly int $id,
		public readonly int $userId,
		public readonly string $title,
		public readonly ?string $content = null,
		public readonly ?string $searchableText = null,
		public readonly ?string $preview = null,
		public readonly ?NoteSharingType $sharingType = null,
		public readonly ?string $sharingUrl = null,
		public readonly ?string $sharingPassword = null,
		public readonly ?\DateTimeImmutable $createdAt = null,
		public readonly ?\DateTimeImmutable $updatedAt = null,
	) {}
}
