<?php

namespace App\Notes\Presentation\Api;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\DTOs\UserNotesSortOptionsDTO;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Domain\Services\NoteContentStripper;
use App\Notes\Application\Services\NoteApplicationService;
use App\Http\Responses\PaginatedResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Controllers\Controller;
use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Domain\ValueObjects\NotePreview;
use DateTime;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class NoteController extends Controller
{
	protected NoteApplicationService $noteAppService;
	protected NoteLinkService $noteLinkService;
	protected NoteContentStripper $noteContentStripper;

	public function __construct(
		NoteApplicationService $noteAppService,
		NoteLinkService $noteLinkService,
		NoteContentStripper $noteContentStripper,
	) {
		$this->noteAppService = $noteAppService;
		$this->noteLinkService = $noteLinkService;
		$this->noteContentStripper = $noteContentStripper;
	}

	public function index(Request $request): JsonResponse
	{
		try {

			$validated = $request->validate([
				'page_size' => 'integer|min:1|max:100',
			]);

			$pageSize = $validated['page_size'] ?? 10;
			$userId = $this->getAuthenticatedUserId();
			$sortOptions = UserNotesSortOptionsDTO::fromRequest($request->all());

			$data = $this->noteAppService->getUserNotes($userId, $pageSize, $sortOptions);
			$response = new PaginatedResponse($data);

			return response()->json($response->toArray(), Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve notes for user: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve notes.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function store(Request $request): JsonResponse
	{
		try {

			$validated = $request->validate([
				'title' => [
					'required',
					'string',
					'max:50',
					'regex:/^[a-zA-Z0-9_-]+$/',
					'not_regex:/^-/',
					'not_regex:/-$/',
					'not_regex:/--/',
				],
				'content' => 'nullable|string'
			]);

			$userId = $this->getAuthenticatedUserId();

			$createNoteDTO = new CreateNoteDTO(
				title: $validated['title'],
				content: $validated['content'] ?? null,
				searchableText: $validated['content'] ?? null
					? $this->noteContentStripper->stripMarkdownToText($validated['content'])
					: null,
				userId: $userId,
				sharingType: NoteSharingType::PRIVATE,
			);

			$note = $this->noteAppService->createNote($createNoteDTO);
			return response()->json($note, Response::HTTP_CREATED);
		} catch (ValidationException $e) {
			$errors = $e->validator->errors();
			Log::warning("Validation failed for note creation: " . json_encode($errors->all()));

			return response()->json([
				'error' => 'Validation failed.',
				'errors' => $errors->all(),
				'details' => $errors->toArray()
			], Response::HTTP_UNPROCESSABLE_ENTITY);
		} catch (\Illuminate\Database\QueryException $e) {
			if ($e->getCode() === '23505') {
				Log::warning("Duplicate note title: {$validated['title']}");
				return response()->json([
					'errors' => ['title' => ['A note with this title already exists.']]
				], Response::HTTP_UNPROCESSABLE_ENTITY);
			}
			Log::error("Database error on note creation: {$e->getMessage()}");
			return response()->json(['error' => 'Database error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		} catch (\Exception $e) {

			Log::error("Failed to create note: {$e->getMessage()}");
			return response()->json(['error' => "{$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function update(Request $request, int $id): JsonResponse
	{
		try {

			$userId = $this->getAuthenticatedUserId();

			$request->merge([
				'title' => $request->input('title') === '' ? null : $request->input('title')
			]);

			$validated = $request->validate([
				'title' => [
					'nullable',
					'string',
					'max:50',
					'regex:/^[a-zA-Z0-9_-]+$/',
					'not_regex:/^-/',
					'not_regex:/-$/',
					'not_regex:/--/',
				],
				'content' => 'nullable|string'
			]);

			$updateNoteDTO = new UpdateNoteDTO(
				title: $validated['title'],
				content: $validated['content'] ?? null,
				searchableText: null,
				preview: ""
			);

			$note = $this->noteAppService->updateNote($id, $userId, $updateNoteDTO);
			return response()->json($note, Response::HTTP_OK);
		} catch (ValidationException $e) {
			$errors = $e->validator->errors();
			Log::warning("Validation failed for note update: " . json_encode($errors->all()));

			return response()->json([
				'error' => 'Validation failed.',
				'errors' => $errors->all(),
				'details' => $errors->toArray()
			], Response::HTTP_UNPROCESSABLE_ENTITY);
		} catch (\Illuminate\Database\QueryException $e) {
			if ($e->getCode() === '23505') {
				Log::warning("Duplicate note title on update for note $id");
				return response()->json([
					'errors' => ['title' => ['A note with this title already exists.']]
				], Response::HTTP_UNPROCESSABLE_ENTITY);
			}
			Log::error("Database error on note update $id: {$e->getMessage()}");
			return response()->json(['error' => 'Database error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		} catch (\Exception $e) {

			Log::error("Failed to update note $id: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to update note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function destroy(int $id): JsonResponse
	{
		try {

			$userId = $this->getAuthenticatedUserId();

			$note = $this->noteAppService->deleteNote($id, $userId);

			return response()->json($note, Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to delete note $id: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to delete note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getNoteTitles(Request $request): JsonResponse
	{
		try {

			$validated = $request->validate([
				'page_size' => 'integer|min:1|max:100',
				'exclude_id' => 'nullable|integer'
			]);

			$pageSize = $validated['page_size'] ?? 10;
			$excludeId = $validated['exclude_id'] ?? null;
			$filter = $request->input('q', '');
			$userId = $this->getAuthenticatedUserId();

			$data = $this->noteAppService->getNoteTitlesPaginated(
				$userId,
				$filter,
				$pageSize,
				$excludeId
			);
			$response = new PaginatedResponse($data);

			return response()->json($response->toArray(), Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve note titles for user: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve note titles.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getUserNotesPreview(Request $request): JsonResponse
	{
		try {

			$validated = $request->validate([
				'page_size' => 'integer|min:1|max:100',
			]);

			$pageSize = $validated['page_size'] ?? 10;
			$userId = $this->getAuthenticatedUserId();
			$sortOptions = UserNotesSortOptionsDTO::fromRequest($request->all());

			$data = $this->noteAppService->getUserNotesPreview($userId, $pageSize, $sortOptions);
			$response = new PaginatedResponse($data);

			return response()->json($response->toArray(), Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve notes for user: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve notes.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getUserNoteById(Request $request, int $id): JsonResponse
	{
		try {
			$userId = $this->getAuthenticatedUserId();

			$note = $this->noteAppService->getUserNote($id, $userId);

			return response()->json($note, Response::HTTP_OK);
		} catch (ModelNotFoundException $e) {

			return response()->json([
				'error' => 'Note not found.'
			], Response::HTTP_NOT_FOUND);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve note $id for user: {$e->getMessage()}");
			return response()->json(['error' => "{$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getUserNotesForSync(Request $request): JsonResponse
	{
		try {

			$userId = $this->getAuthenticatedUserId();
			$validated = $request->validate([
				'last_sync' => 'nullable|string|date_format:Y-m-d\TH:i:s\Z'
			]);

			$lastSyncString = $validated['last_sync'] ?? null;

			$lastSync = $lastSyncString
				? new DateTime($validated['last_sync'])
				: null;

			$notes = $this->noteAppService->getUserNotesForSync($userId, $lastSync);

			return response()->json(['notes' => $notes]);
		} catch (\Exception $e) {
			Log::error("Failed to retrieve notes for sync for user_id $userId: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve notes for sync.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getDeltaNotes(Request $request): JsonResponse
	{
		try {

			$userId = $this->getAuthenticatedUserId();

			$validated = $request->validate([
				'last_sync' => 'sometimes|string|date_format:Y-m-d\TH:i:s.v\Z'
			]);

			$since = $validated['last_sync'] ?? '1970-01-01T00:00:00Z';

			$delta = $this->noteAppService->getDeltaNotesByUser($userId, $since);

			return response()->json($delta);
		} catch (\Exception $e) {
			Log::error("Failed to retrieve delta notes for sync $userId for user: {$e->getMessage()}");
			return response()->json(['error' => "Failed to retrieve delta notes for sync. {$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function share(Request $request, int $id): JsonResponse
	{

		try {

			$userId = $this->getAuthenticatedUserId();

			$validated = $request->validate([
				'sharing_type' => 'required|in:public,password_protected,private',
				'sharing_password' => 'required_if:sharing_type,password_protected',
			]);

			$shareNoteDTO = new ShareNoteDTO(
				sharingType: NoteSharingType::from($validated['sharing_type']),
				sharingPassword: $validated['sharing_password'] ?? null
			);

			$note = $this->noteAppService->shareNote($id, $userId, $shareNoteDTO);
			return response()->json($note, Response::HTTP_OK);
		} catch (ValidationException $e) {

			$errors = $e->validator->errors();
			Log::error("Failed to share note invalid $id: {$e->getMessage()}");

			if ($errors->has('sharing_password')) {
				return response()->json([
					'errors' => $errors->first('sharing_password'),
					'code' => NoteErrorCode::PROTECTED_PASSWORD_MISSING->value
				], Response::HTTP_UNPROCESSABLE_ENTITY);
			}

			return response()->json(['errors' => $errors->all()], Response::HTTP_UNPROCESSABLE_ENTITY);
		} catch (\Exception $e) {

			Log::error("Failed to share note $id: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to share note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function getSharedNote(Request $request, string $sharingUrl): JsonResponse
	{
		try {
			$validated = $request->validate([
				'sharing_password' => 'nullable|string'
			]);

			$note = $this->noteAppService->getNoteBySharingUrl($sharingUrl, $validated['sharing_password'] ?? null);
			return response()->json($note, Response::HTTP_OK);
		} catch (AuthorizationException $e) {

			$errorCode = $e->getCode();

			Log::error("Unauthorized to retrieve shared note for URL $sharingUrl: {$e->getMessage()}");
			return response()->json([
				'error' => 'Unauthorized.',
				'code' => $errorCode
			], Response::HTTP_UNAUTHORIZED);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve shared note for URL $sharingUrl: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve shared note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function findAllLinksForUser(Request $request): JsonResponse
	{

		try {

			$userId = $this->getAuthenticatedUserId();

			$links = $this->noteLinkService->findAllLinksForUser($userId);
			return response()->json($links, Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to get links: {$e->getMessage()}");
			return response()->json(['error' => "{$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}
}
