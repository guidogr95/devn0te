<?php

namespace App\Connectors\Presentation\Api;

use App\Connectors\Application\DTOs\SaveConnectorDTO;
use App\Connectors\Application\Services\ConnectorApplicationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ConnectorController extends Controller
{
	protected ConnectorApplicationService $service;

	public function __construct(ConnectorApplicationService $service)
	{
		$this->service = $service;
	}

	public function index(Request $request): JsonResponse
	{
		try {
			$userId = $request->user()->id;
			$connectors = $this->service->getUserConnectors($userId);

			return response()->json([
				'connectors' => array_map(fn ($c) => [
					'type' => $c->type,
					'settings' => $c->settings,
				], $connectors),
			]);
		} catch (\Exception $e) {
			Log::error('Failed to fetch connectors', ['error' => $e->getMessage()]);
			return response()->json(['error' => 'Failed to fetch connectors.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function store(Request $request): JsonResponse
	{
		try {
			$validated = $request->validate([
				'type' => 'required|string|in:github,s3,r2',
				'settings' => 'required|array',
				'settings.owner' => 'required_if:type,github|string',
				'settings.repo' => 'required_if:type,github|string',
				'settings.branch' => 'required_if:type,github|string',
			]);

			$userId = $request->user()->id;
			$connector = $this->service->saveConnector(new SaveConnectorDTO(
				userId: $userId,
				type: $validated['type'],
				settings: $validated['settings'],
			));

			return response()->json([
				'connector' => [
					'type' => $connector->type,
					'settings' => $connector->settings,
				],
			]);
		} catch (\Illuminate\Validation\ValidationException $e) {
			return response()->json(['errors' => $e->errors()], Response::HTTP_UNPROCESSABLE_ENTITY);
		} catch (\Exception $e) {
			Log::error('Failed to save connector', ['error' => $e->getMessage()]);
			return response()->json(['error' => 'Failed to save connector.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}

	public function destroy(Request $request, string $type): JsonResponse
	{
		try {
			$userId = $request->user()->id;
			$this->service->deleteConnector($userId, $type);

			return response()->json(null, Response::HTTP_NO_CONTENT);
		} catch (\Exception $e) {
			Log::error('Failed to delete connector', ['error' => $e->getMessage()]);
			return response()->json(['error' => 'Failed to delete connector.'], Response::HTTP_INTERNAL_SERVER_ERROR);
		}
	}
}
