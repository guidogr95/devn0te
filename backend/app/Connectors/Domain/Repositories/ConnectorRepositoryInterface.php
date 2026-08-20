<?php

namespace App\Connectors\Domain\Repositories;

use App\Connectors\Application\DTOs\SaveConnectorDTO;
use App\Connectors\Domain\Models\Connector as DomainConnector;
use App\Connectors\Infrastructure\Persistence\Connector;

interface ConnectorRepositoryInterface
{
	/** @return DomainConnector[] */
	public function findByUserId(int $userId): array;

	public function save(SaveConnectorDTO $dto): Connector;

	public function deleteByUserAndType(int $userId, string $type): bool;
}
