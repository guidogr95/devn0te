<?php

namespace App\Notes\Domain\Repositories;

use App\Notes\Domain\Models\NoteLink;

interface NoteLinkRepositoryInterface
{
	public function create(NoteLink $noteLink): NoteLink;

	public function deleteBySource(string $connectorId): void;

	public function deleteBySourceOrTarget(string $connectorId): void;

	public function deleteBySourceAndTarget(string $sourceConnectorId, string $targetConnectorId): void;

	public function findLinksForSource(string $connectorId): array;

	public function findLinksForTarget(string $connectorId): array;

	public function findAllLinksForUser(int $userId): array;
}