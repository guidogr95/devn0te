<?php

namespace App\Connectors\Domain\Models;

class Connector
{
	public function __construct(
		public readonly int $id,
		public readonly int $userId,
		public readonly string $type,
		public readonly array $settings,
		public readonly ?\DateTimeImmutable $createdAt = null,
		public readonly ?\DateTimeImmutable $updatedAt = null,
	) {}
}
