<?php

namespace App\Providers;

use App\Domain\Notes\Repositories\NoteRepositoryInterface;
use App\Domain\Notes\Services\NoteApplicationService;
use App\Domain\Notes\Services\NoteDomainService;
use App\Infrastructure\Notes\Repositories\EloquentNoteRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repositories
        $this->app->bind(NoteRepositoryInterface::class, EloquentNoteRepository::class);

        //Domain Services
        $this->app->singleton(NoteDomainService::class, function ($app) {
            return new NoteDomainService($app->make(NoteRepositoryInterface::class));
        });

        // Application Services
        $this->app->singleton(NoteApplicationService::class, function ($app) {
            return new NoteApplicationService(
                $app->make(NoteDomainService::class),
                $app->make(NoteRepositoryInterface::class)
            );
        });

        $this->app->register(AuthServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
