<?php

namespace App\Notes\Infrastructure\Listeners;

use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Domain\Events\NoteCreatedEvent;
use App\Notes\Domain\Events\NoteUpdatedEvent;

class SyncNoteLinks
{
	public function __construct(
		protected NoteLinkService $noteLinkService
	) {}

	public function handleNoteCreated(NoteCreatedEvent $event): void
	{
		$this->noteLinkService->syncLinksFromContent($event->noteId, $event->content);
	}

	public function handleNoteUpdated(NoteUpdatedEvent $event): void
	{
		$this->noteLinkService->syncLinksFromContent($event->noteId, $event->content);
	}
}
