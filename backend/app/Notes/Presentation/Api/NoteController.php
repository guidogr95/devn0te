<?php

namespace App\Notes\Presentation\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\PaginatedResponse;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\ShareNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\DTOs\UserNotesSortOptionsDTO;
use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Domain\Services\NoteContentStripper;
use App\Notes\Infrastructure\Persistence\DeviceSyncCursor;
use Carbon\Carbon;
use DateTime;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
                'content' => 'nullable|string',
                'connector_id' => ['nullable', 'string', 'uuid'],
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
                connectorId: $validated['connector_id'] ?? null,
            );

            $note = $this->noteAppService->createNote($createNoteDTO);

            return response()->json($note, Response::HTTP_CREATED);
        } catch (ValidationException $e) {
            $errors = $e->validator->errors();
            Log::warning('Validation failed for note creation: '.json_encode($errors->all()));

            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $errors->all(),
                'details' => $errors->toArray(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23505') {
                $errorCode = NoteErrorCode::fromQueryException($e);
                $message = $errorCode === NoteErrorCode::CONNECTOR_ID_COLLISION
                    ? 'A note with this connector_id already exists.'
                    : 'A note with this title already exists.';
                Log::warning("Duplicate constraint on note creation: {$message}");

                return response()->json([
                    'error' => $message,
                    'code' => $errorCode->value,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            Log::error("Database error on note creation: {$e->getMessage()}");

            return response()->json(['error' => 'Database error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {

            Log::error('create note failed', ['exception' => $e]);

            return response()->json(['error' => 'Failed to create note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {

            $userId = $this->getAuthenticatedUserId();

            $request->merge([
                'title' => $request->input('title') === '' ? null : $request->input('title'),
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
                'content' => 'nullable|string',
            ]);

            $updateNoteDTO = new UpdateNoteDTO(
                title: $validated['title'],
                content: $validated['content'] ?? null,
                searchableText: null,
                preview: ''
            );

            $note = $this->noteAppService->updateNote($id, $userId, $updateNoteDTO);

            return response()->json($note, Response::HTTP_OK);
        } catch (ValidationException $e) {
            $errors = $e->validator->errors();
            Log::warning('Validation failed for note update: '.json_encode($errors->all()));

            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $errors->all(),
                'details' => $errors->toArray(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23505') {
                $errorCode = NoteErrorCode::fromQueryException($e);
                $message = $errorCode === NoteErrorCode::CONNECTOR_ID_COLLISION
                    ? 'A note with this connector_id already exists.'
                    : 'A note with this title already exists.';
                Log::warning("Duplicate constraint on note update $id: {$message}");

                return response()->json([
                    'error' => $message,
                    'code' => $errorCode->value,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            Log::error("Database error on note update $id: {$e->getMessage()}");

            return response()->json(['error' => 'Database error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (NotFoundHttpException $e) {
            Log::warning("Note not found: $id");

            return response()->json(['error' => 'Note not found.'], Response::HTTP_NOT_FOUND);
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
        } catch (NotFoundHttpException $e) {
            Log::warning("Note not found: $id");

            return response()->json(['error' => 'Note not found.'], Response::HTTP_NOT_FOUND);
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
                'exclude_id' => 'nullable|integer',
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

            if (! $note) {
                return response()->json([
                    'error' => 'Note not found.',
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json($note, Response::HTTP_OK);
        } catch (\Exception $e) {

            Log::error('get note failed', ['note_id' => $id, 'exception' => $e]);

            return response()->json(['error' => 'Failed to retrieve note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserNotesForSync(Request $request): JsonResponse
    {
        try {

            $userId = $this->getAuthenticatedUserId();
            $validated = $request->validate([
                'last_sync' => 'nullable|string|date_format:Y-m-d\TH:i:s\Z',
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
        $userId = $this->getAuthenticatedUserId();
        $deviceId = $request->header('X-Device-Id');

        try {
            $validated = $request->validate([
                'limit' => 'sometimes|integer|min:1|max:500',
            ]);
        } catch (ValidationException $e) {
            $errors = $e->validator->errors();
            Log::warning('Delta validation failed: '.json_encode($errors->all()));

            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $errors->all(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $limit = $validated['limit'] ?? 100;

        if ($deviceId && strlen($deviceId) > 36) {
            return response()->json([
                'error' => 'Validation failed.',
                'errors' => ['X-Device-Id must not exceed 36 characters.'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            if ($deviceId) {
                return DB::transaction(function () use ($userId, $deviceId, $limit) {
                    DeviceSyncCursor::query()->insertOrIgnore([
                        'user_id' => $userId,
                        'device_id' => $deviceId,
                        'last_synced_at' => '1970-01-01 00:00:00',
                    ]);

                    $cursor = DeviceSyncCursor::where('user_id', $userId)
                        ->where('device_id', $deviceId)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $since = $cursor->last_synced_at->toDateTimeString();
                    $delta = $this->noteAppService->getDeltaNotesByUser($userId, $since, $limit);

                    $highWater = Carbon::parse($since);

                    foreach ($delta['notes'] as $note) {
                        $noteUpdatedAt = Carbon::parse($note['updated_at']);
                        if ($noteUpdatedAt->gt($highWater)) {
                            $highWater = $noteUpdatedAt;
                        }
                    }

                    foreach ($delta['deleted'] as $deleted) {
                        $deletedAt = Carbon::parse($deleted['deleted_at']);
                        if ($deletedAt->gt($highWater)) {
                            $highWater = $deletedAt;
                        }
                    }

                    if ($highWater->gt($cursor->last_synced_at)) {
                        $cursor->update(['last_synced_at' => $highWater]);
                    }

                    return response()->json([
                        'notes' => $delta['notes'],
                        'deleted' => array_map(
                            fn (array $d): int => (int) $d['note_id'],
                            $delta['deleted']
                        ),
                    ]);
                });
            }

            $validated = $request->validate([
                'last_sync' => 'sometimes|nullable|string|date',
            ]);
            $since = $validated['last_sync'] ?? '1970-01-01T00:00:00Z';

            $delta = $this->noteAppService->getDeltaNotesByUser($userId, $since);

            return response()->json([
                'notes' => $delta['notes'],
                'deleted' => array_map(
                    fn (array $d): int => (int) $d['note_id'],
                    $delta['deleted']
                ),
            ]);
        } catch (ValidationException $e) {
            $errors = $e->validator->errors();
            Log::warning('Delta validation failed: '.json_encode($errors->all()));

            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $errors->all(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            Log::error('get delta notes failed', ['user_id' => $userId, 'exception' => $e]);

            return response()->json(['error' => 'Failed to retrieve delta notes for sync.'], Response::HTTP_INTERNAL_SERVER_ERROR);
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
                    'code' => NoteErrorCode::PROTECTED_PASSWORD_MISSING->value,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return response()->json(['errors' => $errors->all()], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (NotFoundHttpException $e) {
            Log::warning("Note not found: $id");

            return response()->json(['error' => 'Note not found.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {

            Log::error("Failed to share note $id: {$e->getMessage()}");

            return response()->json(['error' => 'Failed to share note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function unshare(int $id): JsonResponse
    {
        try {

            $userId = $this->getAuthenticatedUserId();

            $note = $this->noteAppService->unshareNote($id, $userId);

            return response()->json($note, Response::HTTP_OK);
        } catch (NotFoundHttpException $e) {
            Log::warning("Note not found: $id");

            return response()->json(['error' => 'Note not found.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {

            Log::error("Failed to unshare note $id: {$e->getMessage()}");

            return response()->json(['error' => 'Failed to unshare note.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getSharedNote(Request $request, string $sharingUrl): JsonResponse
    {
        try {
            $validated = $request->validate([
                'sharing_password' => 'nullable|string',
            ]);

            $note = $this->noteAppService->getNoteBySharingUrl($sharingUrl, $validated['sharing_password'] ?? null);

            return response()->json($note, Response::HTTP_OK);
        } catch (AuthorizationException $e) {

            $errorCode = $e->getCode();

            Log::error("Unauthorized to retrieve shared note for URL $sharingUrl: {$e->getMessage()}");

            return response()->json([
                'error' => 'Unauthorized.',
                'code' => $errorCode,
            ], Response::HTTP_UNAUTHORIZED);
        } catch (NotFoundHttpException $e) {
            Log::warning("Shared note not found: $sharingUrl");

            return response()->json(['error' => 'Note not found.'], Response::HTTP_NOT_FOUND);
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

            Log::error('get links failed', ['exception' => $e]);

            return response()->json(['error' => 'Failed to get links.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
