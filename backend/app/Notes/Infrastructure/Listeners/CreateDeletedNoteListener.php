<?php

namespace App\Notes\Infrastructure\Listeners;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Domain\Events\NoteDeletedEvent;
use Illuminate\Support\Facades\Log;

class CreateDeletedNoteListener
{

	public function __construct(
		private NoteApplicationService $noteAppService,
	) {
	}

	public function handle(NoteDeletedEvent $event): void
	{

		$dto = new CreateDeletedNoteDTO(
			noteId: $event->noteId,
			userId: $event->userId
		);

		try {
			$this->noteAppService->createDeletedNote($dto);

		} catch (\Exception $e) {

			Log::error("Failed to create deleted note from note: {$e->getMessage()}");

		}

	}
}
