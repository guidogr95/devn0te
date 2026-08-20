<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('device_sync_cursors', function (Blueprint $table) {
			$table->id();
			$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
			$table->char('device_id', 36);
			$table->timestamp('last_synced_at')->default('1970-01-01 00:00:00');
			$table->timestamps();
			$table->unique(['user_id', 'device_id']);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('device_sync_cursors');
	}
};
