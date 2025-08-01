<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{

  protected UserService $userService;

	public function __construct(UserService $userService)
	{
		$this->userService = $userService;
	}


  public function login(Request $request): JsonResponse
  {
    $credentials = $request->only('email', 'password');

    try {

      Auth::shouldUse('web');
      if (Auth::attempt($credentials)) {
        $userId = Auth::user()?->id;
  
        if ($userId === null) {
          throw new AuthorizationException('Unauthorized access');
        }
  
        $user = $this->userService->getUserById($userId);
  
        if ($user) {
          $token = $user->createToken('Personal Access Token')->accessToken;
  
          return response()->json([
            'token' => $token,
            'user' => $user
          ]);
        } else {
          return response()->json(['error' => 'Not found'], 404);
        }
      }
  
      return response()->json(['error' => 'Unathorized'], 401);

		} catch (\Exception $e) {

			Log::error("Failed to login: {$e->getMessage()}");
			return response()->json(['error' => "Failed to login: {$e->getMessage()}"], Response::HTTP_INTERNAL_SERVER_ERROR);

		}

  }

  public function getUserFromToken(Request $request): JsonResponse
  {
    $user = Auth::guard('api')->user();

    if ($user) {
      return response()->json(['user' => $user]);
    } else {
      return response()->json(['error' => 'Unauthorized'], 401);
    }
  }

  public function register(Request $request): JsonResponse
  {

    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:6|confirmed'
    ]);

    $user = $this->userService->createUser([
      'name' => $validated['name'],
      'email' => $validated['email'],
      'password' => Hash::make($validated['password'])
    ]);

    $token = $user->createToken('Personal Access Token')->accessToken;

    return response()->json([
      'token' => $token,
      'user' => $user
    ], 201);
  }
}
