<?php

use App\Notes\Domain\ValueObjects\NotePreview;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->text('preview')->nullable()->after('searchable_text');
        });

        $this->populatePreviewField();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('preview');
        });
    }

    private function populatePreviewField(): void
    {
        DB::transaction(function () {
            DB::table('notes')
                ->whereNull('preview')
                ->chunkById(100, function ($notes) {
                    foreach ($notes as $note) {
                        $preview = $this->generatePreview($note->searchable_text ?? '');
                        
                        DB::table('notes')
                            ->where('id', $note->id)
                            ->update(['preview' => $preview]);
                    }
                });
        });
    }

    private function generatePreview(string $content): string
    {
        if (empty($content)) {
            return '';
        }

        $preview = (new NotePreview($content))->getValue();
        return $preview;
    }
};
