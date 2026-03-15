<?php

namespace App\Notes\Infrastructure\Listeners;

use App\Notes\Domain\Events\NoteDeleted;
use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Domain\Events\NoteDeletedEvent;

class RemoveNoteLinks
{
	public function __construct(
		protected NoteLinkService $noteLinkService
	) {}

	public function handle(NoteDeletedEvent $event): void
	{
		$this->noteLinkService->removeLinksForDeletedNote($event->noteId);
	}
}
