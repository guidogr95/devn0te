<?php

namespace App\Console\Commands;

use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Infrastructure\Persistence\Note as EloquentNote;
use Illuminate\Console\Command;

class SyncNoteLinksCommand extends Command
{
	protected $signature = 'notes:sync-links';
	protected $description = 'Re-sync all [[id]] wiki-link references from note content into the note_links table';

	public function __construct(
		private NoteLinkService $noteLinkService,
	) {
		parent::__construct();
	}

	public function handle(): void
	{
		$notes = EloquentNote::whereNotNull('content')->get();

		$this->info("Syncing links for {$notes->count()} notes...");

		foreach ($notes as $note) {
			$this->noteLinkService->syncLinksFromContent($note->id, $note->content);
		}

		$this->info('Done.');
	}
}
