<?php

use App\Http\Controllers\AuthController;
use App\Notes\Presentation\Api\NoteController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// Route::get('/test-note', function () {
// 	Log::info('Current APP_KEY: ' . config('app.key'));
	
// 	return Note::create([
// 		'title' => 'Test Encrypted Title 3',
// 		'content' => 'Test Encrypted Content 3',
// 		'user_id' => 3
// 	]);

// 	return response()->json(['message' => 'Route tested']);
// });

Route::prefix('v1')->group(function() {
	Route::middleware('auth:api')->group(function () {
		// Notes auth routes

		Route::apiResource('notes', NoteController::class);
		Route::get('note/{id}', [NoteController::class, 'getUserNoteById']);
		Route::post('notes/{id}/share', [NoteController::class, 'share']);
		Route::get('user/notes/titles', [NoteController::class, 'getNoteTitles']);
		Route::get('user/notes/links', [NoteController::class, 'findAllLinksForUser']);
		Route::get('user/notes/sync', [NoteController::class, 'getUserNotesForSync']);
		Route::get('user/notes/delta', [NoteController::class, 'getDeltaNotes']);
		Route::get('user/notes/preview', [NoteController::class, 'getUserNotesPreview']);
	});

	Route::get('shared-notes/{sharingUrl}', [NoteController::class, 'getSharedNote']);

	// Auth handling routes
	Route::post('login', [AuthController::class, 'login']);
	Route::post('register', [AuthController::class, 'register']);
	Route::get('user', [AuthController::class, 'getUserFromToken']);
});
 