<?php

namespace App\Domain\Notes\Enums;

enum NoteSharingType: string
{
    case PRIVATE = 'private';
    case PUBLIC = 'public';
    case PASSWORD_PROTECTED = 'password_protected';
}
