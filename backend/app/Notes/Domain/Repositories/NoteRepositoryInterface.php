<?php

namespace App\Notes\Domain\Repositories;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Models\Note as DomainNote;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use DateTime;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NoteRepositoryInterface
{
	public function create(CreateNoteDTO $dto): Note;
	public function update(Note $note): Note;
	public function delete(Note $note): bool|null;
	public function findById(int $id): DomainNote;
	/**
	 * Get all notes for a user.
	 *
	 * @param int $userId
	 * @param int $pageSize
	 * @return LengthAwarePaginator<Note>
	 */
	public function getUserNotes(
		int $userId,
		int $pageSize,
		?UserNoteSortField $sortField = null,
		?SortDirection $sortDirection = null
	): LengthAwarePaginator;
	/**
	 * Get all notes for a user.
	 *
	 * @param int $userId
	 * @param int $pageSize
	 * @return LengthAwarePaginator<Note>
	 */
	public function getUserNotesPreview(
		int $userId,
		int $pageSize,
		?UserNoteSortField $sortField = null,
		?SortDirection $sortDirection = null
	): LengthAwarePaginator;
	public function getUserNote(int $id, int $userId): ?Note;
	/**
	 * @return Note[]
	 */
	public function getAllNotesByUserId(int $userId, ?DateTime $since = null): array;
	public function findBySharingUrl(string $sharingUrl): ?Note;
	/**
	 * Get delta changes for a user since a given timestamp.
	 *
	 * @param int $userId
	 * @param DateTime $since
	 * @return array{notes: Note[], deleted: int[]}
	 */
	public function findDeltaByUser(int $userId, DateTime $since): array;
	/**
	 * @return array<int>
	 */
	public function getAllDeletedNotesByUserId(int $userId, DateTime $since): array;
	public function createDeletedNote(CreateDeletedNoteDTO $dto): DeletedNote;

	/**
	 * Paginated note titles for autocomplete.
	 *
	 * @param int $userId
	 * @param string $filter
	 * @param int $pageSize
	 * @param int|null $excludeId
	 * @return LengthAwarePaginator
	 */
	public function getNoteTitlesPaginated(
		int $userId,
		string $filter = '',
		int $pageSize = 20,
		?int $excludeId = null,
	): LengthAwarePaginator;

	/**
	 * Given an array of note IDs and a user ID, return only the IDs that belong to the user.
	*
	* @param int[] $ids
	* @param int $userId
	* @return int[] Valid note IDs
	*/
	public function filterValidIdsForUser(array $ids, int $userId): array;
}
