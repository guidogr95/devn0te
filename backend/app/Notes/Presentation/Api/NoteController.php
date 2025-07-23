<?php

namespace App\Notes\Presentation\Api;

use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\DTOs\UserNotesSortOptionsDTO;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Application\Services\NoteApplicationService;
use App\Http\Responses\PaginatedResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Controllers\Controller;

class NoteController extends Controller
{
	protected NoteApplicationService $noteAppService;

	public function __construct(
		NoteApplicationService $noteAppService
	)
	{
		$this->noteAppService = $noteAppService;
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
				'title' => 'nullable|string|max:255',
				'content' => 'nullable|string'
			]);

			$userId = $this->getAuthenticatedUserId();

			$createNoteDTO = new CreateNoteDTO(
				title: $validated['title'] ?? null,
				content: $validated['content'] ?? null,
				userId: $userId,
				sharingType: NoteSharingType::PRIVATE,
			);

			$note = $this->noteAppService->createNote($createNoteDTO);
			return response()->json($note, Response::HTTP_CREATED);

		} catch (\Exception $e) {

			Log::error("Failed to create note: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to create note.'], Response::HTTP_INTERNAL_SERVER_ERROR);

		}
	}

	public function update(Request $request, int $id): JsonResponse
	{
		try {

			$userId = $this->getAuthenticatedUserId();

			$validated = $request->validate([
				'title' => 'nullable|string|max:255',
				'content' => 'nullable|string'
			]);

			$updateNoteDTO = new UpdateNoteDTO(
				title: $validated['title'] ?? null,
				content: $validated['content'] ?? null,
			);

			$note = $this->noteAppService->updateNote($id, $userId, $updateNoteDTO);
			return response()->json($note, Response::HTTP_OK);

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

	public function getUserNoteById(Request $request, int $id): JsonResponse
	{
		try {
			$userId = $this->getAuthenticatedUserId();

			$note = $this->noteAppService->getUserNote($id, $userId);

			return response()->json($note, Response::HTTP_OK);
		} catch (\Exception $e) {

			Log::error("Failed to retrieve note $id for user: {$e->getMessage()}");
			return response()->json(['error' => 'Failed to retrieve note.'], Response::HTTP_INTERNAL_SERVER_ERROR);

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
}
