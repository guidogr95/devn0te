<?php

namespace App\Connectors\Application\DTOs;

class SaveConnectorDTO
{
	public function __construct(
		public readonly int $userId,
		public readonly string $type,
		public readonly array $settings,
	) {}
}
