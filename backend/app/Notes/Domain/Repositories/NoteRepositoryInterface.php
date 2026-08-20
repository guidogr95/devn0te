<?php

namespace App\Notes\Domain\Repositories;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Domain\Enums\SortDirection;
use App\Notes\Domain\Enums\UserNoteSortField;
use App\Notes\Domain\Models\Note as DomainNote;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use App\Notes\Infrastructure\Persistence\Note;
use DateTime;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NoteRepositoryInterface
{
    public function create(CreateNoteDTO $dto): Note;

    public function update(Note $note): Note;

    public function delete(Note $note): ?bool;

    public function findById(int $id): DomainNote;

    /**
     * @return LengthAwarePaginator<Note>
     */
    public function getUserNotes(
        int $userId,
        int $pageSize,
        ?UserNoteSortField $sortField = null,
        ?SortDirection $sortDirection = null
    ): LengthAwarePaginator;

    /**
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
    public function getAllNotesByUserId(int $userId, ?DateTime $since = null, ?int $limit = null): array;

    public function findBySharingUrl(string $sharingUrl): ?Note;

    /**
     * @return array{notes: Note[], deleted: array<int, array{note_id: int, deleted_at: string}>}
     */
    public function findDeltaByUser(int $userId, DateTime $since, ?int $limit = null): array;

    /**
     * @return array<int, array{note_id: int, deleted_at: string}>
     */
    public function getAllDeletedNotesByUserId(int $userId, DateTime $since, ?int $limit = null): array;

    public function createDeletedNote(CreateDeletedNoteDTO $dto): DeletedNote;

    public function getNoteTitlesPaginated(
        int $userId,
        string $filter = '',
        int $pageSize = 20,
        ?int $excludeId = null,
    ): LengthAwarePaginator;

    /**
     * @param  int[]  $ids
     * @return int[]
     */
    public function filterValidIdsForUser(array $ids, int $userId): array;

    /**
     * @param  string[]  $titles
     * @return array<string, string>
     */
    public function findConnectorIdsByTitlesForUser(array $titles, int $userId): array;

    public function getUserNoteByConnectorId(string $connectorId, int $userId): ?Note;
}
