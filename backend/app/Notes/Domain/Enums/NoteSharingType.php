<?php

namespace App\Notes\Domain\Enums;

enum NoteSharingType: string
{
    case PRIVATE = 'private';
    case PUBLIC = 'public';
    case PASSWORD_PROTECTED = 'password_protected';
}
