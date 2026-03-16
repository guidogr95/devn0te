<?php

namespace App\Notes\Application\Services;

use App\Notes\Application\DTOs\CreateDeletedNoteDTO;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\DTOs\UserNotesSortOptionsDTO;
use App\Notes\Domain\Events\NoteCreatedEvent;
use App\Notes\Domain\Events\NoteDeletedEvent;
use App\Notes\Domain\Events\NoteUpdatedEvent;
use App\Notes\Infrastructure\Persistence\Note;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Domain\Services\NoteDomainService;
use App\Notes\Infrastructure\Persistence\DeletedNote;
use DateTime;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NoteApplicationService
{
	protected NoteDomainService $domainService;
	protected NoteRepositoryInterface $noteRepository;

	public function __construct(
		NoteDomainService $domainService,
		NoteRepositoryInterface $noteRepository
	) {
		$this->domainService = $domainService;
		$this->noteRepository = $noteRepository;
	}


	public function createNote(CreateNoteDTO $dto): Note
	{
		$result = $this->domainService->createNote($dto);

		if ($result) {
			event(new NoteCreatedEvent($result->id, $dto->content));
		}

		return $result;
	}


	public function updateNote(int $id, int $userId, UpdateNoteDTO $dto): ?Note
	{
		$note = $this->noteRepository->getUserNote($id, $userId);

		if (!$note) {
			throw new NotFoundHttpException('Note not found');
		}

		$note->updateContent(
			$dto->title,
			$dto->content,
			$dto->searchableText,
			$dto->preview
		);

		$result = $this->noteRepository->update($note);

		if ($result && $dto->content !== null) {
			event(new NoteUpdatedEvent($note->id, $dto->content));
		}

		return $result;
	}


	public function deleteNote(int $id, int $userId): ?Note
	{
		$note = $this->noteRepository->getUserNote($id, $userId);

		if (!$note) {
			throw new NotFoundHttpException('Note not found');
		}

		$result = $this->noteRepository->delete($note);

		if ($result) {
			event(new NoteDeletedEvent($note->id, $userId));
		}

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

	public function getUserNotesForSync(int $userId, ?DateTime $since = null): array
	{
		return $this->noteRepository->getAllNotesByUserId($userId, $since);
	}

	public function createDeletedNote(CreateDeletedNoteDTO $dto): DeletedNote
	{
		return $this->noteRepository->createDeletedNote($dto);
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

	/**
	 * Paginated note titles for autocomplete.
	 *
	 * @param string $filter
	 * @param int|null $excludeId
	 * @param int $pageSize
	 * @return LengthAwarePaginator
	 */
	public function getNoteTitlesPaginated(
		int $userId,
		string $filter = '',
		int $pageSize = 20,
		?int $excludeId = null,
		): LengthAwarePaginator
	{

		return $this->noteRepository->getNoteTitlesPaginated(
			$userId,
			$filter,
			$pageSize,
			$excludeId,
		);
	}

	/**
	 * Get all notes for a user.
	 *
	 * @param int $userId
	 * @param int $pageSize
	 * @return LengthAwarePaginator<Note>
	 */
	public function getUserNotesPreview(int $userId, int $pageSize, UserNotesSortOptionsDTO $sortOptions): LengthAwarePaginator
	{
		return $this->noteRepository->getUserNotesPreview(
			$userId,
			$pageSize,
			$sortOptions->field,
			$sortOptions->direction
		);
	}

	/**
	 * Get delta changes for a user since a given timestamp.
	 *
	 * @param int $userId
	 * @param string $deltaString
	 * @return array{notes: Note[], deleted: DeletedNote[]}
	 */
	public function getDeltaNotesByUser(int $userId, string $deltaString): array
	{
		$delta = new DateTime($deltaString);

		return $this->noteRepository->findDeltaByUser($userId, $delta);
	}
}
