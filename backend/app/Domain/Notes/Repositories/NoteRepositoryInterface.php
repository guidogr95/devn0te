<?php

namespace App\Domain\Notes\Repositories;

use App\Domain\Notes\DTOs\CreateNoteDTO;
use App\Domain\Notes\Entities\Note;
use Illuminate\Database\Eloquent\Collection;

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
	 * @return Collection<int, Note>
	 */
	public function getUserNotes(int $userId): Collection;
	public function getUserNote(int $id, int $userId): ?Note;
	public function findBySharingUrl(string $sharingUrl): ?Note;
}
