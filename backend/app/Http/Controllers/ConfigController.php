<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ConfigController extends Controller
{
	public function index(): JsonResponse
	{
		return response()->json([
			'serverSyncEnabled' => config('app.server_sync_enabled'),
		], Response::HTTP_OK);
	}
}
