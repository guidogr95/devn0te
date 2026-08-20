<?php

use App\Connectors\Presentation\Api\ConnectorController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConfigController;
use App\Notes\Presentation\Api\NoteController;
use App\Notes\Presentation\Api\SyncController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function() {
	Route::get('config', [ConfigController::class, 'index']);

	Route::middleware('auth:api')->group(function () {
		Route::apiResource('notes', NoteController::class);
		Route::get('note/{id}', [NoteController::class, 'getUserNoteById']);
		Route::post('notes/{id}/share', [NoteController::class, 'share']);
		Route::delete('notes/{id}/share', [NoteController::class, 'unshare']);
		Route::get('user/notes/titles', [NoteController::class, 'getNoteTitles']);
		Route::get('user/notes/links', [NoteController::class, 'findAllLinksForUser']);
		Route::get('user/notes/sync', [NoteController::class, 'getUserNotesForSync']);
		Route::get('user/notes/delta', [NoteController::class, 'getDeltaNotes']);
		Route::get('user/notes/preview', [NoteController::class, 'getUserNotesPreview']);
		Route::post('user/notes/sync/push', [SyncController::class, 'push']);

		Route::get('user/connectors', [ConnectorController::class, 'index']);
		Route::post('user/connectors', [ConnectorController::class, 'store']);
		Route::delete('user/connectors/{type}', [ConnectorController::class, 'destroy']);

		Route::get('user', [AuthController::class, 'getUserFromToken']);
	});

	Route::get('shared-notes/{sharingUrl}', [NoteController::class, 'getSharedNote']);

	Route::post('login', [AuthController::class, 'login']);
	Route::post('register', [AuthController::class, 'register']);
});
 