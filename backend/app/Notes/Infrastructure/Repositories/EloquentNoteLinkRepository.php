<?php

namespace App\Notes\Infrastructure\Repositories;

use App\Notes\Domain\Models\NoteLink as DomainNoteLink;
use App\Notes\Domain\Repositories\NoteLinkRepositoryInterface;
use App\Notes\Infrastructure\Persistence\NoteLink as EloquentNoteLink;

class EloquentNoteLinkRepository implements NoteLinkRepositoryInterface
{
	public function create(DomainNoteLink $noteLink): DomainNoteLink
	{
		$eloquent = EloquentNoteLink::create([
			'source_note_id' => $noteLink->sourceNoteId,
			'target_note_id' => $noteLink->targetNoteId,
		]);

		return new DomainNoteLink(
			$eloquent->id,
			$eloquent->source_note_id,
			$eloquent->target_note_id,
			$eloquent->created_at ? $eloquent->created_at->format('Y-m-d H:i:s') : null,
			$eloquent->updated_at ? $eloquent->updated_at->format('Y-m-d H:i:s') : null,
		);
	}

	public function deleteBySource(int $noteId): void
	{
		EloquentNoteLink::where('source_note_id', $noteId)
			->delete();
	}

	public function deleteBySourceOrTarget(int $noteId): void
	{
		EloquentNoteLink::where('source_note_id', $noteId)
			->orWhere('target_note_id', $noteId)
			->delete();
	}

	public function deleteBySourceAndTarget(int $sourceNoteId, int $targetNoteId): void
	{
		EloquentNoteLink::where('source_note_id', $sourceNoteId)
			->orWhere('target_note_id', $targetNoteId)
			->delete();
	}

	public function findLinksForSource(int $sourceNoteId): array
	{
		return EloquentNoteLink::where('source_note_id', $sourceNoteId)
			->get()
			->map(fn($link) => new DomainNoteLink(
				$link->id,
				$link->source_note_id,
				$link->target_note_id,
				$link->created_at,
				$link->updated_at
			))->all();
	}

	public function findLinksForTarget(int $targetNoteId): array
	{
		return EloquentNoteLink::where('target_note_id', $targetNoteId)
			->get()
			->map(fn($link) => new DomainNoteLink(
				$link->id,
				$link->source_note_id,
				$link->target_note_id,
				$link->created_at,
				$link->updated_at
			))->all();
	}

	public function findAllLinksForUser(int $userId): array
	{
		$links = EloquentNoteLink::query()
			->select('note_links.*')
			->join('notes as s', 'note_links.source_note_id', '=', 's.id')
			->join('notes as t', 'note_links.target_note_id', '=', 't.id')
			->where('s.user_id', $userId)
			->where('t.user_id', $userId)
			->get();

		return $links->map(fn($link) => new DomainNoteLink(
			$link->id,
			$link->source_note_id,
			$link->target_note_id,
			$link->created_at ? $link->created_at->format('Y-m-d H:i:s') : null,
			$link->updated_at ? $link->updated_at->format('Y-m-d H:i:s') : null,
		))->all();
	}
}
