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
			'source_connector_id' => $noteLink->sourceConnectorId,
			'target_connector_id' => $noteLink->targetConnectorId,
		]);

		return new DomainNoteLink(
			$eloquent->id,
			$eloquent->source_connector_id,
			$eloquent->target_connector_id,
			$eloquent->created_at ? $eloquent->created_at->format('Y-m-d H:i:s') : null,
			$eloquent->updated_at ? $eloquent->updated_at->format('Y-m-d H:i:s') : null,
		);
	}

	public function deleteBySource(string $connectorId): void
	{
		EloquentNoteLink::where('source_connector_id', $connectorId)
			->delete();
	}

	public function deleteBySourceOrTarget(string $connectorId): void
	{
		EloquentNoteLink::where('source_connector_id', $connectorId)
			->orWhere('target_connector_id', $connectorId)
			->delete();
	}

	public function deleteBySourceAndTarget(string $sourceConnectorId, string $targetConnectorId): void
	{
		EloquentNoteLink::where('source_connector_id', $sourceConnectorId)
			->where('target_connector_id', $targetConnectorId)
			->delete();
	}

	public function findLinksForSource(string $connectorId): array
	{
		return EloquentNoteLink::where('source_connector_id', $connectorId)
			->get()
			->map(fn($link) => new DomainNoteLink(
				$link->id,
				$link->source_connector_id,
				$link->target_connector_id,
				$link->created_at,
				$link->updated_at
			))->all();
	}

	public function findLinksForTarget(string $connectorId): array
	{
		return EloquentNoteLink::where('target_connector_id', $connectorId)
			->get()
			->map(fn($link) => new DomainNoteLink(
				$link->id,
				$link->source_connector_id,
				$link->target_connector_id,
				$link->created_at,
				$link->updated_at
			))->all();
	}

	public function findAllLinksForUser(int $userId): array
	{
		$links = EloquentNoteLink::query()
			->select('note_links.*')
			->join('notes as s', 'note_links.source_connector_id', '=', 's.connector_id')
			->leftJoin('notes as t', 'note_links.target_connector_id', '=', 't.connector_id')
			->where('s.user_id', $userId)
			->get();

		return $links->map(fn($link) => new DomainNoteLink(
			$link->id,
			$link->source_connector_id,
			$link->target_connector_id,
			$link->created_at ? $link->created_at->format('Y-m-d H:i:s') : null,
			$link->updated_at ? $link->updated_at->format('Y-m-d H:i:s') : null,
		))->all();
	}
}
