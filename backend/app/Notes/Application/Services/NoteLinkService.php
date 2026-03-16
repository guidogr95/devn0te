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

	/**
	 * Parse note content for [[id]] references and update links.
	 * @param int $sourceNoteId
	 * @param string $content
	 */
	public function syncLinksFromContent(int $sourceNoteId, ?string $content): void
	{
		if (!$content) {
			$this->noteLinkRepository->deleteBySource($sourceNoteId);
			return;
		}

		try {
			$sourceNote = $this->noteRepository->findById($sourceNoteId);
		} catch (ModelNotFoundException $e) {
			Log::warning("Source note $sourceNoteId not found when syncing links.");
			return;
		}
		
		$userId = $sourceNote->userId;

		preg_match_all('/\[\[(\d+)\]\]/', $content, $matches);
		$linkedIds = array_map('intval', $matches[1]);

		$this->noteLinkRepository->deleteBySource($sourceNoteId);

		if (empty($linkedIds)) {
			return;
		}

		$validTargetIds = $this->noteRepository->filterValidIdsForUser($linkedIds, $userId);

		foreach ($validTargetIds as $targetNoteId) {
			$noteLink = new NoteLink(
				id: 0,
				sourceNoteId: $sourceNoteId,
				targetNoteId: $targetNoteId
			);
			$this->noteLinkRepository->create($noteLink);
		}
	}

	/**
	 * Remove all links for a deleted note.
	 */
	public function removeLinksForDeletedNote(int $noteId): void
	{
		$this->noteLinkRepository->deleteBySourceOrTarget($noteId);
	}

	/**
	 * Remove a specific link between two notes.
	 */
	public function removeLink(int $sourceNoteId, int $targetNoteId): void
	{
		$this->noteLinkRepository->deleteBySourceAndTarget($sourceNoteId, $targetNoteId);
	}

	/**
	 * Get all links for a source note.
	 */
	public function getLinksForSource(int $sourceNoteId): array
	{
		return $this->noteLinkRepository->findLinksForSource($sourceNoteId);
	}

	/**
	 * Get all links for a target note (backlinks).
	 */
	public function getLinksForTarget(int $targetNoteId): array
	{
		return $this->noteLinkRepository->findLinksForTarget($targetNoteId);
	}

	public function findAllLinksForUser(int $userId): array
	{
		return $this->noteLinkRepository->findAllLinksForUser($userId);
	}
}
