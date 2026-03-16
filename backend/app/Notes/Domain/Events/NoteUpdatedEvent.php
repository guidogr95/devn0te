<?php

namespace App\Notes\Domain\Events;

class NoteUpdatedEvent
{
	public function __construct(
		public readonly int $noteId,
		public readonly ?string $content,
	)
	{}
}
