<?php

namespace App\Notes\Domain\Events;

class NoteDeletedEvent
{
	public function __construct(
		public readonly int $noteId,
		public readonly int $userId,
	)
	{}
}
