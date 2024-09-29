<?php

namespace App\Domain\Notes\Services;

use App\Domain\Notes\DTOs\CreateNoteDTO;
use App\Domain\Notes\DTOs\ShareNoteDTO;
use App\Domain\Notes\Entities\Note;
use App\Domain\Notes\Enums\NoteErrorCode;
use App\Domain\Notes\Enums\NoteSharingType;
use App\Domain\Notes\Exceptions\InvalidSharingTypeException;
use App\Domain\Notes\Repositories\NoteRepositoryInterface;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NoteDomainService 
{
	protected NoteRepositoryInterface $noteRepository;

	public function __construct(NoteRepositoryInterface $noteRepository) 
	{
		$this->noteRepository = $noteRepository;
	}

	public function createNote(CreateNoteDTO $dto): Note 
	{
		return $this->noteRepository->create($dto);
	}

	public function shareNote(Note $note, ShareNoteDTO $dto): ?Note
	{

		$note->changeSharingType($dto->sharingType, $dto->sharingPassword);

		return $this->noteRepository->update($note);
	}

	public function getNoteBySharingUrl(string $sharingUrl, ?string $password): ?Note {
		$note = $this->noteRepository->findBySharingUrl($sharingUrl);

		if (!$note) {
			throw new NotFoundHttpException("Note with sharingUrl {$sharingUrl} not found");
		}

		$user = Auth::user();
		
		if (!Gate::forUser($user)->allows('viewByShareUrl', [$note, $password])) {

			if ($note->sharing_type === NoteSharingType::PASSWORD_PROTECTED) {
				throw new AuthorizationException('Invalid password or unauthorized access', NoteErrorCode::PROTECTED_PASSWORD_UNAUTHORIZED->value);
			}

			throw new AuthorizationException('Unauthorized access to private not', NoteErrorCode::PRIVATE_UNAUTHORIZED->value);

		}

		return $note;
	}
}
