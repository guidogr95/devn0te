<?php

namespace App\Notes\Domain\Services;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
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

    public function getNoteBySharingUrl(string $sharingUrl, ?string $password): ?Note
    {
        $note = $this->noteRepository->findBySharingUrl($sharingUrl);

        if (! $note) {
            throw new NotFoundHttpException("Note with sharingUrl {$sharingUrl} not found");
        }

        $user = Auth::user();

        if (! Gate::forUser($user)->allows('viewByShareUrl', [$note, $password])) {

            if ($note->sharing_type === NoteSharingType::PASSWORD_PROTECTED) {
                if (! $password) {
                    throw new AuthorizationException('Password required', NoteErrorCode::PROTECTED_PASSWORD_MISSING->value);
                }
                throw new AuthorizationException('Incorrect password', NoteErrorCode::PROTECTED_PASSWORD_UNAUTHORIZED->value);
            }

            throw new AuthorizationException('Unauthorized access to private note', NoteErrorCode::PRIVATE_UNAUTHORIZED->value);
        }

        return $note;
    }
}
