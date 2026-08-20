<?php

namespace App\Providers;

use App\Connectors\Application\Services\ConnectorApplicationService;
use App\Connectors\Domain\Repositories\ConnectorRepositoryInterface;
use App\Connectors\Infrastructure\Repositories\EloquentConnectorRepository;
use App\Notes\Domain\Repositories\NoteRepositoryInterface;
use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Application\Services\NoteLinkService;
use App\Notes\Domain\Repositories\NoteLinkRepositoryInterface;
use App\Notes\Domain\Services\NoteDomainService;
use App\Notes\Infrastructure\Repositories\EloquentNoteLinkRepository;
use App\Notes\Infrastructure\Repositories\EloquentNoteRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(NoteRepositoryInterface::class, EloquentNoteRepository::class);
        $this->app->bind(NoteLinkRepositoryInterface::class, EloquentNoteLinkRepository::class);
        $this->app->bind(ConnectorRepositoryInterface::class, EloquentConnectorRepository::class);

        $this->app->singleton(NoteDomainService::class, function ($app) {
            return new NoteDomainService($app->make(NoteRepositoryInterface::class));
        });

        $this->app->singleton(NoteLinkService::class, function ($app) {
            return new NoteLinkService(
                $app->make(NoteLinkRepositoryInterface::class),
                $app->make(NoteRepositoryInterface::class)

            );
        });

        $this->app->singleton(NoteApplicationService::class, function ($app) {
            return new NoteApplicationService(
                $app->make(NoteDomainService::class),
                $app->make(NoteRepositoryInterface::class)
            );
        });

        $this->app->singleton(ConnectorApplicationService::class, function ($app) {
            return new ConnectorApplicationService(
                $app->make(ConnectorRepositoryInterface::class)
            );
        });

        $this->app->register(AuthServiceProvider::class);
    }

    public function boot(): void
    {
        //
    }
}
