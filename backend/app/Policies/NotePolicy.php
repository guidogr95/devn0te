<?php

namespace App\Policies;

use App\Domain\Notes\Entities\Note;
use App\Domain\Notes\Enums\NoteSharingType;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class NotePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the note by share URL.
     * @param \App\Domain\Notes\Entities\Note $note
     * @param string|null $password
     * @return bool
     */
    public function viewByShareUrl(?User $user, Note $note, ?string $password): bool
    {

        $sharingType = $note->sharing_type;

        if ($user && $user->id === $note->user_id) {
            return true;
        }

        switch ($sharingType) {

            case NoteSharingType::PUBLIC:
                return true;

            case NoteSharingType::PASSWORD_PROTECTED:

                return $note->sharing_password && $password && password_verify($password, $note->sharing_password);

            default:
                return false;
        }
    }
}
