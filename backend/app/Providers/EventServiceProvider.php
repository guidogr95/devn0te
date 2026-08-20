<?php

namespace App\Providers;

use App\Notes\Domain\Events\NoteCreatedEvent;
use App\Notes\Domain\Events\NoteDeletedEvent;
use App\Notes\Domain\Events\NoteUpdatedEvent;
use App\Notes\Infrastructure\Listeners\CreateDeletedNoteListener;
use App\Notes\Infrastructure\Listeners\RemoveNoteLinks;
use App\Notes\Infrastructure\Listeners\SyncNoteLinks;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
	/**
	 * The event to listener mappings for the application.
	 *
	 * @var array<class-string, array<int, class-string>>
	 */
	protected $listen = [
		NoteCreatedEvent::class => [
			[SyncNoteLinks::class, 'handleNoteCreated'],
		],
		NoteUpdatedEvent::class => [
			[SyncNoteLinks::class, 'handleNoteUpdated'],
		],
		NoteDeletedEvent::class => [
			CreateDeletedNoteListener::class,
			RemoveNoteLinks::class,
		],
	];

	/**
	 * Register any events for your application.
	 */
	public function boot(): void
	{
		//
	}

	/**
	 * Determine if events and listeners should be automatically discovered.
	 */
	public function shouldDiscoverEvents(): bool
	{
		return false;
	}
}
