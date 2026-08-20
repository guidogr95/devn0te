<?php

namespace App\Console\Commands;

use App\Notes\Domain\Events\NoteUpdatedEvent;
use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateToConnectorIds extends Command
{
	protected $signature = 'notes:migrate-to-connector-ids';
	protected $description = 'Rewrite [[integer]] wiki-links to [[note-title]] format in all note content.';

	public function handle(): int
	{
		$total = Note::whereNotNull('content')
			->where('content', 'LIKE', '%[[%')
			->count();

		if ($total === 0) {
			$this->info('No notes with [[integer]] links found. Nothing to do.');
			return self::SUCCESS;
		}

		$this->info("Found {$total} notes with potential wiki-links. Processing...");
		$bar = $this->output->createProgressBar($total);
		$bar->start();

		$updated = 0;

		Note::whereNotNull('content')
			->where('content', 'LIKE', '%[[%')
			->cursor()
			->each(function (Note $note) use (&$updated, $bar) {
				$original = $note->content;
				$content = preg_replace_callback('/\[\[(\d+)\]\]/', function ($matches) {
					$target = Note::find((int) $matches[1]);
					return $target ? "[[{$target->title}]]" : $matches[0];
				}, $original);

				if ($content !== $original) {
					DB::table('notes')->where('id', $note->id)->update(['content' => $content]);
					event(new NoteUpdatedEvent($note->id, $content));
					$updated++;
				}

				$bar->advance();
			});

		$bar->finish();
		$this->newLine();
		$this->info("Done. Updated content in {$updated} notes.");

		return self::SUCCESS;
	}
}
