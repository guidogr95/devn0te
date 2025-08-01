<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
	// @phpstan-ignore missingType.iterableValue
	public function create(array $data): User
	{
		return User::create($data);
	}

	// @phpstan-ignore missingType.iterableValue
	public function update(User $user, array $data): User
	{
		$user->update($data);
		return $user;
	}

	public function delete(User $user): bool | null
	{
		return $user->delete();
	}

	public function findById(int $id): ?User
	{
		return User::findOrFail($id);
	}

	public function findByEmail(string $email): ?User
	{
		return User::where('email', $email)->firstOrFail();
	}
}