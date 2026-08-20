<?php

namespace App\Providers;

use App\Notes\Infrastructure\Persistence\Note;
use App\Policies\NotePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
	protected $policies = [
		Note::class => NotePolicy::class
	];

	public function boot(): void
	{
		$this->registerPolicies();
	}
}