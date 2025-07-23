<?php

namespace App\Notes\Domain\Repositories;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NoteRepositoryInterface
{
	public function create(CreateNoteDTO $dto): Note;
	public function update(Note $note): Note;
	public function delete(Note $note): bool|null;
	public function findById(int $id): ?Note;
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
	public function getUserNote(int $id, int $userId): ?Note;
	public function findBySharingUrl(string $sharingUrl): ?Note;
}
