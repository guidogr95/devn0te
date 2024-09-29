<?php

namespace App\Domain\Notes\Enums;

enum NoteErrorCode: int
{
	case PROTECTED_PASSWORD_MISSING = 1001;
	case PROTECTED_PASSWORD_UNAUTHORIZED = 1002;
	case PRIVATE_UNAUTHORIZED = 1003;
}