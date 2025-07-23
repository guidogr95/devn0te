<?php

namespace App\Notes\Application\Services;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\DTOs\UserNotesSortOptionsDTO;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Domain\Services\NoteDomainService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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
	 * @param int $pageSize
	 * @return LengthAwarePaginator<Note>
	 */
	public function getUserNotes(int $userId, int $pageSize, UserNotesSortOptionsDTO $sortOptions): LengthAwarePaginator
	{
		return $this->noteRepository->getUserNotes(
			$userId,
			$pageSize,
			$sortOptions->field,
			$sortOptions->direction
		);
	}

}
