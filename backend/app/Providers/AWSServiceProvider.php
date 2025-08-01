<?php

namespace App\Providers;

use Aws\S3\S3Client;
use Illuminate\Support\ServiceProvider;

class AWSServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(S3Client::class, function ($app) {
            return new S3Client([
                'credentials' => config('aws.credentials'),
                'region' => config('aws.region'),
                'version' => config('aws.version'),
            ]);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
