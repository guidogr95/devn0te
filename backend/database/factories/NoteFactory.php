<?php

namespace Database\Factories;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Notes\Infrastructure\Persistence\Note>
 */
class NoteFactory extends Factory
{
    protected $model = Note::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
        ];
    }

    public static function createFromDTO(CreateNoteDTO $dto): Note
    {
        $note = new Note();

        $sharingUrl = Str::uuid()->toString();

        $note->fill([
            'title' => $dto->title,
            'content' => $dto->content,
            'user_id' => $dto->userId,
            'sharing_type' => $dto->sharingType,
            'sharing_url' => $sharingUrl,
            'sharing_password' => $dto->sharingPassword ? bcrypt($dto->sharingPassword) : null,
            'connector_id' => $dto->connectorId ?? (string) Str::uuid(),
        ]);

        return $note;
    }
}
