<?php

namespace App\Domain\Notes\Services;

use App\Domain\Notes\DTOs\CreateNoteDTO;
use App\Domain\Notes\DTOs\ShareNoteDTO;
use App\Domain\Notes\DTOs\UpdateNoteDTO;
use App\Domain\Notes\Entities\Note;
use App\Domain\Notes\Repositories\NoteRepositoryInterface;
use App\Domain\Notes\Services\NoteDomainService;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NoteApplicationService
{
	protected NoteDomainService $domainService;
	protected NoteRepositoryInterface $noteRepository;

	public function __construct(
		NoteDomainService $domainService,
		NoteRepositoryInterface $noteRepository
	)
	{
		$this->domainService = $domainService;
		$this->noteRepository = $noteRepository;
	}
	

	public function createNote(CreateNoteDTO $dto): Note
	{
		return $this->domainService->createNote($dto);
	}


	public function updateNote(int $id, int $userId, UpdateNoteDTO $dto): ?Note {
		$note = $this->noteRepository->getUserNote($id, $userId);

		if (!$note) {
			throw new NotFoundHttpException('Note not found');
		}

		$note->updateContent($dto->title, $dto->content);

		return $this->noteRepository->update($note);
	}


	public function deleteNote(int $id, int $userId): ?Note {
		$note = $this->noteRepository->getUserNote($id, $userId);

		if (!$note) {
			throw new NotFoundHttpException('Note not found');
		}

		$this->noteRepository->delete($note);

		return $note;
	}


	public function shareNote(int $id, int $userId, ShareNoteDTO $dto): ?Note
	{
		$note = $this->noteRepository->getUserNote($id, $userId);

		if (!$note) {
			throw new NotFoundHttpException('Note not found');
		}

		return $this->domainService->shareNote($note, $dto);
	}


	public function getUserNote(int $id, int $userId): ?Note
	{
		return $this->noteRepository->getUserNote($id, $userId);
	}


	public function getNoteBySharingUrl(string $sharingUrl, ?string $password = null): ?Note
	{
		return $this->domainService->getNoteBySharingUrl($sharingUrl, $password);
	}


	/**
	 * Get all notes for a user.
	 *
	 * @param int $userId
	 * @return Collection<int, Note>
	 */
	public function getUserNotes(int $userId): Collection
	{
		return $this->noteRepository->getUserNotes($userId);
	}

}
