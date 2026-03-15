<?php

namespace App\Notes\Infrastructure\Repositories;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Models\Note as DomainNote;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use Carbon\Carbon;
use Database\Factories\NoteFactory;
use DateTime;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

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

	public function findById(int $id): DomainNote
	{
		$eloquentNote = Note::findOrFail($id);
		
		return new DomainNote(
			id: $eloquentNote->id,
			userId: $eloquentNote->user_id,
			title: $eloquentNote->title,
			content: $eloquentNote->content,
			searchableText: $eloquentNote->searchable_text ?? null,
			preview: $eloquentNote->preview ?? null,
			sharingType: $eloquentNote->sharing_type ?? null,
			sharingUrl: $eloquentNote->sharing_url ?? null,
			sharingPassword: $eloquentNote->sharing_password ?? null,
			createdAt: $eloquentNote->created_at ? \DateTimeImmutable::createFromMutable($eloquentNote->created_at) : null,
			updatedAt: $eloquentNote->updated_at ? \DateTimeImmutable::createFromMutable($eloquentNote->updated_at) : null,
		);
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
	): LengthAwarePaginator {
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
	): LengthAwarePaginator {
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
			->select(['id', 'user_id', 'title', 'content', 'updated_at']);

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
	): LengthAwarePaginator {
		$query = Note::where('user_id', $userId)
			->select(['id', 'title']);

		if ($filter) {
			$query->where('title', 'ILIKE', "%{$filter}%");
		}

		if ($excludeId) {
			$query->where('id', '!=', $excludeId);
		}

		return $query->orderBy('title')->paginate($pageSize);
	}

	public function filterValidIdsForUser(array $ids, int $userId): array
	{
		if (empty($ids)) {
			return [];
		}

		return Note::query()
			->whereIn('id', $ids)
			->where('user_id', $userId)
			->pluck('id')
			->map(fn($id) => (int) $id)
			->all();
	}
}
