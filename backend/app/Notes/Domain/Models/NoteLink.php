<?php

namespace App\Notes\Domain\Models;

class NoteLink
{
	public function __construct(
		public readonly int $id,
		public readonly int $sourceNoteId,
		public readonly int $targetNoteId,
		public readonly ?string $createdAt = null,
		public readonly ?string $updatedAt = null,
	)
	{
		
	}
}