<?php

namespace App\Notes\Infrastructure\Repositories;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use Carbon\Carbon;
use Database\Factories\NoteFactory;
use DateTime;
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
	): LengthAwarePaginator
	{
		$query = Note::where('user_id', $userId)
			->select(['id', 'user_id', 'title', 'preview', 'created_at', 'updated_at']);

		if ($sortField && $sortDirection) {
			$query->orderBy($sortField->value, $sortDirection->value);
		}

		return $query->paginate($pageSize);
	}


	/**
	 * Get delta changes for a user since a given timestamp.
	 *
	 * @param int $userId
	 * @param DateTime $since
	 * @return array{notes: Note[], deleted: int[]}
	 */
	public function findDeltaByUser(int $userId, DateTime $since): array
	{
		$notes = $this->getAllNotesByUserId($userId, $since);

		$deleted = $this->getAllDeletedNotesByUserId($userId, $since);

		return ['notes' => $notes, 'deleted' => $deleted];
	}

	public function createDeletedNote(CreateDeletedNoteDTO $dto): DeletedNote
	{
		$deleted_note = DeletedNote::create([
			'note_id' => $dto->noteId,
			'user_id' => $dto->userId,
			'deleted_at' => Carbon::now(),
		]);
		return $deleted_note;
	}


	/**
	 * @return array<int>
	 */
	public function getAllDeletedNotesByUserId(int $userId, DateTime $since): array
	{
		$deleted = DeletedNote::where('user_id', $userId)
			->where('deleted_at', '>', $since)
			->pluck('note_id')
			->values()
			->toArray();

			return array_map(fn($id) => (int) $id, $deleted);
	}


	/**
	 * @return Note[]
	 */
	public function getAllNotesByUserId(int $userId, ?DateTime $since = null): array
	{

		$query = Note::where('user_id', $userId)
			->select(['id', 'user_id', 'title', 'searchable_text', 'updated_at']);

		if ($since) {
			$query->where('updated_at', '>', $since);
		}

		return $query->get()->toArray();
	}

	public function getUserNote(int $id, int $userId): ?Note
	{
		return Note::where('user_id', $userId)->where('id', $id)->firstOrFail();
	}

	public function findBySharingUrl(string $sharingUrl): ?Note
	{
		return Note::where('sharing_url', $sharingUrl)->firstOrFail();
	}

}
