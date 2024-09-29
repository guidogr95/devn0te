<?php

namespace Database\Factories;

use App\Domain\Notes\DTOs\CreateNoteDTO;
use App\Domain\Notes\Entities\Note;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AppDomainNotesEntitiesNote>
 */
class NoteFactory extends Factory
{

    protected $model = Note::class;

    /**
     * Define the model's default state.
     *
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

        $uniqueString = Str::random(10);

        $sharingUrl = $note->id . $uniqueString;

        $note->fill([
            'title' => $dto->title,
            'content' => $dto->content,
            'user_id' => $dto->userId,
            'sharing_type' => $dto->sharingType,
            'sharing_url' => $sharingUrl,
            'sharing_password' => $dto->sharingPassword ? bcrypt($dto->sharingPassword) : null
        ]);

        return $note;
    }
}
