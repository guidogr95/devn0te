<?php

namespace App\Notes\Application\Services;

use App\Notes\Domain\Models\NoteLink;
use App\Notes\Domain\Repositories\NoteLinkRepositoryInterface;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class NoteLinkService
{
	public function __construct(
		private NoteLinkRepositoryInterface $noteLinkRepository,
		private NoteRepositoryInterface $noteRepository
	) {}

	public function syncLinksFromContent(int $sourceNoteId, ?string $content): void
	{
		try {
			$sourceNote = $this->noteRepository->findById($sourceNoteId);
		} catch (ModelNotFoundException $e) {
			Log::warning("Source note $sourceNoteId not found when syncing links.");
			return;
		}

		$sourceConnectorId = $sourceNote->connectorId;
		$userId = $sourceNote->userId;

		$this->noteLinkRepository->deleteBySource($sourceConnectorId);

		if (!$content) {
			return;
		}

		preg_match_all('/\[\[([^\]]+)\]\]/', $content, $matches);
		$titles = array_unique($matches[1]);

		if (empty($titles)) {
			return;
		}

		$titleToConnectorId = $this->noteRepository->findConnectorIdsByTitlesForUser($titles, $userId);

		foreach ($titles as $title) {
			$targetConnectorId = $titleToConnectorId[$title] ?? null;
			$noteLink = new NoteLink(
				id: 0,
				sourceConnectorId: $sourceConnectorId,
				targetConnectorId: $targetConnectorId,
			);
			$this->noteLinkRepository->create($noteLink);
		}
	}

	public function removeLinksForDeletedNote(string $connectorId): void
	{
		$this->noteLinkRepository->deleteBySourceOrTarget($connectorId);
	}

	public function removeLink(string $sourceConnectorId, string $targetConnectorId): void
	{
		$this->noteLinkRepository->deleteBySourceAndTarget($sourceConnectorId, $targetConnectorId);
	}

	public function getLinksForSource(string $connectorId): array
	{
		return $this->noteLinkRepository->findLinksForSource($connectorId);
	}

	public function getLinksForTarget(string $connectorId): array
	{
		return $this->noteLinkRepository->findLinksForTarget($connectorId);
	}

	public function findAllLinksForUser(int $userId): array
	{
		return $this->noteLinkRepository->findAllLinksForUser($userId);
	}
}
