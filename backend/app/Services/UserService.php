<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;

class UserService
{
	protected UserRepository $userRepository;

	public function __construct(UserRepository $userRepository)
	{
		$this->userRepository = $userRepository;
	}

	// @phpstan-ignore missingType.iterableValue
	public function createUser(array $data): User
	{
		return $this->userRepository->create($data);
	}

	public function getUserById(int $id): ?User
	{
		$user = $this->userRepository->findById($id);

		return $user;
	}
	
	// @phpstan-ignore missingType.parameter
	public function getUserByEmail($email): ?User
	{
		$user = $this->userRepository->findByEmail($email);

		return $user;
	}

}