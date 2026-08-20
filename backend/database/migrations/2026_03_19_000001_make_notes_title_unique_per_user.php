<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('notes', function (Blueprint $table) {
			$table->dropUnique('notes_title_unique');
			$table->unique(['user_id', 'title'], 'notes_user_id_title_unique');
		});
	}

	public function down(): void
	{
		Schema::table('notes', function (Blueprint $table) {
			$table->dropUnique('notes_user_id_title_unique');
			$table->unique('title', 'notes_title_unique');
		});
	}
};
