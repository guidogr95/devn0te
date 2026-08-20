<?php

namespace App\Notes\Presentation\Api;

use App\Http\Controllers\Controller;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Domain\Services\NoteContentStripper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SyncController extends Controller
{
    protected NoteApplicationService $noteAppService;

    protected NoteContentStripper $noteContentStripper;

    protected NoteRepositoryInterface $noteRepository;

    public function __construct(
        NoteApplicationService $noteAppService,
        NoteContentStripper $noteContentStripper,
        NoteRepositoryInterface $noteRepository,
    ) {
        $this->noteAppService = $noteAppService;
        $this->noteContentStripper = $noteContentStripper;
        $this->noteRepository = $noteRepository;
    }

    public function push(Request $request): JsonResponse
    {
        try {
            $titleRules = [
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_-]+$/',
                'not_regex:/^-/',
                'not_regex:/-$/',
                'not_regex:/--/',
            ];

            $validated = $request->validate([
                'created' => 'array',
                'created.*.connector_id' => ['required', 'string', 'uuid'],
                'created.*.title' => array_merge(['required'], $titleRules),
                'created.*.content' => 'nullable|string',
                'updated' => 'array',
                'updated.*.id' => 'required|integer',
                'updated.*.connector_id' => 'sometimes|string|uuid',
                'updated.*.title' => array_merge(['nullable'], $titleRules),
                'updated.*.content' => 'nullable|string',
                'deleted' => 'array',
                'deleted.*' => 'required|string|uuid',
            ]);

            $userId = $this->getAuthenticatedUserId();
            $createdResults = [];

            DB::transaction(function () use ($validated, $userId, &$createdResults) {
                foreach ($validated['created'] ?? [] as $item) {
                    $dto = new CreateNoteDTO(
                        userId: $userId,
                        sharingType: NoteSharingType::PRIVATE,
                        title: $item['title'],
                        content: $item['content'] ?? null,
                        searchableText: ! empty($item['content'])
                            ? $this->noteContentStripper->stripMarkdownToText($item['content'])
                            : null,
                        connectorId: $item['connector_id'],
                    );

                    $note = $this->noteAppService->createNote($dto);
                    $createdResults[] = ['id' => $note->id, 'connector_id' => $note->connector_id];
                }

                foreach ($validated['updated'] ?? [] as $item) {
                    $note = $this->noteRepository->getUserNote($item['id'], $userId);

                    if (! $note && ! empty($item['connector_id'])) {
                        $note = $this->noteRepository->getUserNoteByConnectorId($item['connector_id'], $userId);
                    }

                    if (! $note) {
                        Log::warning("Sync push skipped unknown updated note id {$item['id']}");

                        continue;
                    }

                    $dto = new UpdateNoteDTO(
                        title: $item['title'] ?? null,
                        content: $item['content'] ?? null,
                        searchableText: ! empty($item['content'])
                            ? $this->noteContentStripper->stripMarkdownToText($item['content'])
                            : null,
                        preview: '',
                    );

                    $this->noteAppService->updateNote($note->id, $userId, $dto);
                }

                foreach ($validated['deleted'] ?? [] as $connectorId) {
                    $note = $this->noteRepository->getUserNoteByConnectorId($connectorId, $userId);
                    if ($note) {
                        $this->noteAppService->deleteNote($note->id, $userId);
                    }
                }
            });

            return response()->json([
                'created' => $createdResults,
                'errors' => [],
            ], Response::HTTP_OK);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->validator->errors();
            Log::warning('Sync push validation failed: '.json_encode($errors->all()));

            return response()->json([
                'error' => 'Validation failed.',
                'errors' => $errors->all(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23505') {
                $errorCode = NoteErrorCode::fromQueryException($e);
                $message = $errorCode === NoteErrorCode::CONNECTOR_ID_COLLISION
                    ? 'A note with this connector_id already exists.'
                    : 'A note with this title already exists.';
                Log::warning("Duplicate constraint during sync push: {$message}");

                return response()->json([
                    'error' => $message,
                    'code' => $errorCode->value,
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            Log::error("Sync push failed: {$e->getMessage()}");

            return response()->json(['error' => 'Sync push failed.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            Log::error("Sync push failed: {$e->getMessage()}");

            return response()->json(['error' => 'Sync push failed.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
