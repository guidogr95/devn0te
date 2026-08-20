<?php

namespace App\Connectors\Infrastructure\Repositories;

use App\Connectors\Application\DTOs\SaveConnectorDTO;
use App\Connectors\Domain\Models\Connector as DomainConnector;
use App\Connectors\Domain\Repositories\ConnectorRepositoryInterface;
use App\Connectors\Infrastructure\Persistence\Connector;
use DateTimeImmutable;

class EloquentConnectorRepository implements ConnectorRepositoryInterface
{
	public function findByUserId(int $userId): array
	{
		return Connector::where('user_id', $userId)
			->get()
			->map(fn (Connector $c) => $this->toDomain($c))
			->all();
	}

	public function save(SaveConnectorDTO $dto): Connector
	{
		$connector = Connector::updateOrCreate(
			['user_id' => $dto->userId, 'type' => $dto->type],
			['settings' => $dto->settings]
		);

		return $connector;
	}

	public function deleteByUserAndType(int $userId, string $type): bool
	{
		return (bool) Connector::where('user_id', $userId)
			->where('type', $type)
			->delete();
	}

	private function toDomain(Connector $c): DomainConnector
	{
		return new DomainConnector(
			id: $c->id,
			userId: $c->user_id,
			type: $c->type,
			settings: $c->settings ?? [],
			createdAt: $c->created_at ? new DateTimeImmutable($c->created_at) : null,
			updatedAt: $c->updated_at ? new DateTimeImmutable($c->updated_at) : null,
		);
	}
}
