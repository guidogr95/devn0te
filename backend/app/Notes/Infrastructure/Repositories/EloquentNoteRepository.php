<?php

namespace App\Notes\Infrastructure\Repositories;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use Database\Factories\NoteFactory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentNoteRepository implements NoteRepositoryInterface
{

	public function create(CreateNoteDTO $dto): Note
	{
		$note = NoteFactory::createFromDTO($dto);
		$note->save();
		return $note;
	}

	public function update(Note $note): Note
	{
		$note->save();
		return $note;
	}

	public function delete(Note $note): bool|null
	{
		return $note->delete();
	}

	public function findById(int $id): ?Note
	{
		return Note::findOrFail($id);
	}

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
	): LengthAwarePaginator
	{
		$query = Note::where('user_id', $userId);

		if ($sortField && $sortDirection) {
			$query->orderBy($sortField->value, $sortDirection->value);
		}

		return $query->paginate($pageSize);
	}

	public function getUserNote(int $id, int $userId): ?Note
	{
		return Note::where('user_id', $userId)->where('id', $id)->first();
	}

	public function findBySharingUrl(string $sharingUrl): ?Note
	{
		return Note::where('sharing_url', $sharingUrl)->firstOrFail();
	}

}
