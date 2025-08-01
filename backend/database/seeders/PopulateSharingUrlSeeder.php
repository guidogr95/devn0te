<?php

namespace Database\Seeders;

use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PopulateSharingUrlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $notes = Note::whereNull('sharing_url')->get();

        foreach ($notes as $note) {
            $uniqueString = Str::random(10);

            $sharingUrl = $note->id . $uniqueString;

            $note->sharing_url = $sharingUrl;

            $note->save();
        }

        $count = $notes->count();
        $this->command->info("Sharing url updated for {$count} notes.");
    }
}
