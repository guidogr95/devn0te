<?php

namespace App\Notes\Domain\Models;

class NoteLink
{
	public function __construct(
		public readonly int $id,
		public readonly string $sourceConnectorId,
		public readonly ?string $targetConnectorId,
		public readonly ?string $createdAt = null,
		public readonly ?string $updatedAt = null,
	)
	{
		
	}
}