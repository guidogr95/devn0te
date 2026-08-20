<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('notes', function (Blueprint $table) {
			$table->string('connector_id', 36)->nullable()->after('id');
		});

		DB::table('notes')->orderBy('id')->cursor()->each(function ($note) {
			DB::table('notes')->where('id', $note->id)->update([
				'connector_id' => (string) Str::uuid(),
			]);
		});

		DB::statement('ALTER TABLE notes ALTER COLUMN connector_id SET NOT NULL');
		Schema::table('notes', function (Blueprint $table) {
			$table->unique('connector_id');
		});

		Schema::table('note_links', function (Blueprint $table) {
			$table->string('source_connector_id', 36)->nullable()->after('id');
			$table->string('target_connector_id', 36)->nullable()->after('source_connector_id');
		});

		DB::statement('
			UPDATE note_links nl
			SET source_connector_id = (SELECT connector_id FROM notes WHERE id = nl.source_note_id),
			    target_connector_id = (SELECT connector_id FROM notes WHERE id = nl.target_note_id)
		');

		Schema::table('note_links', function (Blueprint $table) {
			$table->dropForeign(['source_note_id']);
			$table->dropForeign(['target_note_id']);
			$table->dropColumn(['source_note_id', 'target_note_id']);
		});

		DB::statement('ALTER TABLE note_links ALTER COLUMN source_connector_id SET NOT NULL');
		Schema::table('note_links', function (Blueprint $table) {
			$table->foreign('source_connector_id')
				->references('connector_id')
				->on('notes')
				->onDelete('cascade');
			$table->foreign('target_connector_id')
				->references('connector_id')
				->on('notes')
				->onDelete('cascade');
		});
	}

	public function down(): void
	{
		Schema::table('note_links', function (Blueprint $table) {
			$table->dropForeign(['source_connector_id']);
			$table->dropForeign(['target_connector_id']);
		});

		Schema::table('note_links', function (Blueprint $table) {
			$table->unsignedBigInteger('source_note_id')->nullable()->after('id');
			$table->unsignedBigInteger('target_note_id')->nullable()->after('source_note_id');
		});

		DB::statement('
			UPDATE note_links nl
			SET source_note_id = (SELECT id FROM notes WHERE connector_id = nl.source_connector_id),
			    target_note_id = (SELECT id FROM notes WHERE connector_id = nl.target_connector_id)
		');

		Schema::table('note_links', function (Blueprint $table) {
			$table->dropColumn(['source_connector_id', 'target_connector_id']);
		});

		DB::statement('ALTER TABLE note_links ALTER COLUMN source_note_id SET NOT NULL');
		DB::statement('ALTER TABLE note_links ALTER COLUMN target_note_id SET NOT NULL');
		Schema::table('note_links', function (Blueprint $table) {
			$table->foreign('source_note_id')->references('id')->on('notes')->onDelete('cascade');
			$table->foreign('target_note_id')->references('id')->on('notes')->onDelete('cascade');
		});

		Schema::table('notes', function (Blueprint $table) {
			$table->dropUnique(['connector_id']);
			$table->dropColumn('connector_id');
		});
	}
};
