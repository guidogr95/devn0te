<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('connectors', function (Blueprint $table) {
			$table->id();
			$table->foreignId('user_id')->constrained()->onDelete('cascade');
			$table->string('type', 50);
			$table->json('settings')->default('{}');
			$table->timestamps();
			$table->unique(['user_id', 'type']);
		});
	}

	public function down(): void
	{
		Schema::dropIfExists('connectors');
	}
};
