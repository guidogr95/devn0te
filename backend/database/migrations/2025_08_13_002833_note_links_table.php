<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("note_links", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_note_id');
            $table->unsignedBigInteger('target_note_id');
            $table->timestamps();

            $table->foreign('source_note_id')
                ->references('id')->on('notes')
                ->onDelete('cascade'); //Cascade delete if source note is deleted

            $table->foreign('target_note_id')
                ->references('id')->on('notes')
                ->onDelete('cascade'); // Cascade delete if target note is deleted

            $table->unique(['source_note_id', 'target_note_id'], 'note_links_unique');
            $table->index('source_note_id');
            $table->index('target_note_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_links');
    }
};
