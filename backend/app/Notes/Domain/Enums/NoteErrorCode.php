<?php

namespace App\Notes\Domain\Enums;

use Illuminate\Database\QueryException;

enum NoteErrorCode: int
{
    case TITLE_TAKEN = 1004;
    case PROTECTED_PASSWORD_MISSING = 1001;
    case PROTECTED_PASSWORD_UNAUTHORIZED = 1002;
    case PRIVATE_UNAUTHORIZED = 1003;
    case CONNECTOR_ID_COLLISION = 1005;

    // Pgsql embeds the constraint name in errorInfo[2]: e.g.
    // 'duplicate key value violates unique constraint "notes_connector_id_unique"'
    public static function fromQueryException(QueryException $e): self
    {
        $detail = (string) ($e->errorInfo[2] ?? $e->getMessage());

        return str_contains($detail, 'notes_connector_id_unique')
            ? self::CONNECTOR_ID_COLLISION
            : self::TITLE_TAKEN;
    }
}
