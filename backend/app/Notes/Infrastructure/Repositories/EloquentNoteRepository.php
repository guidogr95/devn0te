<?php

namespace App\Notes\Infrastructure\Repositories;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Domain\Models\Note as DomainNote;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use App\Notes\Infrastructure\Persistence\Note;
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

    public function delete(Note $note): ?bool
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
            connectorId: $eloquentNote->connector_id,
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
     * @return array{notes: Note[], deleted: array<int, array{note_id: int, deleted_at: string}>}
     */
    public function findDeltaByUser(int $userId, DateTime $since, ?int $limit = null): array
    {
        $notes = $this->getAllNotesByUserId($userId, $since, $limit);

        $deleted = $this->getAllDeletedNotesByUserId($userId, $since, $limit);

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
     * @return array<int, array{note_id: int, deleted_at: string}>
     */
    public function getAllDeletedNotesByUserId(int $userId, DateTime $since, ?int $limit = null): array
    {
        $query = DeletedNote::where('user_id', $userId)
            ->where('deleted_at', '>', $since)
            ->orderBy('deleted_at', 'asc')
            ->orderBy('id', 'asc');

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get()
            ->map(fn ($row) => [
                'note_id' => (int) $row->note_id,
                'deleted_at' => $row->deleted_at->toDateTimeString(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * @return Note[]
     */
    public function getAllNotesByUserId(int $userId, ?DateTime $since = null, ?int $limit = null): array
    {

        $query = Note::where('user_id', $userId)
            ->select(['id', 'user_id', 'title', 'content', 'updated_at', 'connector_id']);

        if ($since) {
            $query->where('updated_at', '>', $since);
        }

        if ($limit !== null) {
            $query->orderBy('updated_at', 'asc')
                ->orderBy('id', 'asc')
                ->limit($limit);
        }

        return $query->get()->toArray();
    }

    public function getUserNote(int $id, int $userId): ?Note
    {
        return Note::where('user_id', $userId)->where('id', $id)->first();
    }

    public function findBySharingUrl(string $sharingUrl): ?Note
    {
        return Note::where('sharing_url', $sharingUrl)->first();
    }

    public function getNoteTitlesPaginated(
        int $userId,
        string $filter = '',
        int $pageSize = 20,
        ?int $excludeId = null,
    ): LengthAwarePaginator {
        $query = Note::where('user_id', $userId)
            ->select(['id', 'title']);

        if ($filter) {
            $query->whereRaw('LOWER(title) LIKE LOWER(?)', ["%{$filter}%"]);
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
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    public function findConnectorIdsByTitlesForUser(array $titles, int $userId): array
    {
        if (empty($titles)) {
            return [];
        }

        return Note::where('user_id', $userId)
            ->whereIn('title', $titles)
            ->pluck('connector_id', 'title')
            ->all();
    }

    public function getUserNoteByConnectorId(string $connectorId, int $userId): ?Note
    {
        return Note::where('user_id', $userId)->where('connector_id', $connectorId)->first();
    }
}
