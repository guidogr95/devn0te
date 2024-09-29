<?php

namespace App\Infrastructure\Notes\Repositories;

use App\Domain\Notes\DTOs\CreateNoteDTO;
use App\Domain\Notes\Entities\Note;
use App\Domain\Notes\Repositories\NoteRepositoryInterface;
use Database\Factories\NoteFactory;
use Illuminate\Database\Eloquent\Collection;

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
	 * @return Collection<int, Note>
	 */
	public function getUserNotes(int $userId): Collection
	{
		return Note::where('user_id', $userId)->get();
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
