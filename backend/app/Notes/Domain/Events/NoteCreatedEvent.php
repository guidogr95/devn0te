<?php

namespace App\Notes\Domain\Events;

class NoteCreatedEvent
{
	public function __construct(
		public readonly int $noteId,
		public readonly ?string $content,
	)
	{}
}
