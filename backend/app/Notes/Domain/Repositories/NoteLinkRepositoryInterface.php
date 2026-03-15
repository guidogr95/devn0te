<?php

namespace App\Notes\Domain\Repositories;

use App\Notes\Domain\Models\NoteLink;

interface NoteLinkRepositoryInterface
{
	public function create(NoteLink $noteLink): NoteLink;

	public function deleteBySource(int $noteId): void;

	public function deleteBySourceOrTarget(int $noteId): void;

	public function deleteBySourceAndTarget(int $sourceNoteId, int $targetNoteId): void;

	public function findLinksForSource(int $sourceNoteId): array;

	public function findLinksForTarget(int $targetNoteId): array;

	public function findAllLinksForUser(int $userId): array;
}