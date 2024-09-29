<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Access\AuthorizationException;

trait AuthenticatedUser
{

	protected function getAuthenticatedUserId(): int
	{
		/** @var int|null $userId */
		$userId = Auth::id();

		if ($userId === null) {
			throw new AuthorizationException('Unauthorized access');
		}

		return $userId;
	}

}
