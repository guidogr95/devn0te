<?php

namespace App\Connectors\Application\Services;

use App\Connectors\Application\DTOs\SaveConnectorDTO;
use App\Connectors\Domain\Models\Connector as DomainConnector;
use App\Connectors\Domain\Repositories\ConnectorRepositoryInterface;
use App\Connectors\Infrastructure\Persistence\Connector;

class ConnectorApplicationService
{
	protected ConnectorRepositoryInterface $repository;

	public function __construct(ConnectorRepositoryInterface $repository)
	{
		$this->repository = $repository;
	}

	/** @return DomainConnector[] */
	public function getUserConnectors(int $userId): array
	{
		return $this->repository->findByUserId($userId);
	}

	public function saveConnector(SaveConnectorDTO $dto): Connector
	{
		return $this->repository->save($dto);
	}

	public function deleteConnector(int $userId, string $type): bool
	{
		return $this->repository->deleteByUserAndType($userId, $type);
	}
}
