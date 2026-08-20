<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private const VALID_REGISTRATION_DATA = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedPersonalAccessClient();
    }

    private function seedPersonalAccessClient(): void
    {
        $exists = DB::table('oauth_clients')
            ->where('personal_access_client', true)
            ->exists();

        if (!$exists) {
            $clientId = DB::table('oauth_clients')->insertGetId([
                'name' => 'Test Personal Access Client',
                'secret' => Str::random(40),
                'redirect' => 'http://localhost',
                'personal_access_client' => true,
                'password_client' => false,
                'revoked' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('oauth_personal_access_clients')->insert([
                'client_id' => $clientId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /** @test */
    public function it_registers_a_new_user_successfully(): void
    {
        $response = $this->postJson('/api/v1/register', self::VALID_REGISTRATION_DATA);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    /** @test */
    public function it_returns_validation_errors_on_invalid_registration(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors']);
    }

    /** @test */
    public function it_returns_a_passport_token_on_successful_login(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'login@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertNotEmpty($response->json('token'));
    }

    /** @test */
    public function it_returns_unauthorized_on_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'login@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Unauthorized']);
    }

    /** @test */
    public function it_returns_generic_error_on_server_failure_without_leaking_exception(): void
    {
        $sentinelMessage = 'SECRET_DB_CONNECTION_STRING_12345';

        User::factory()->create([
            'email' => 'throw@example.com',
            'password' => bcrypt('password123'),
        ]);

        $userServiceMock = \Mockery::mock(\App\Services\UserService::class);
        $userServiceMock
            ->shouldReceive('getUserById')
            ->once()
            ->andThrow(new \RuntimeException($sentinelMessage));
        $this->app->instance(\App\Services\UserService::class, $userServiceMock);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'throw@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(500)
            ->assertJson(['error' => 'Login failed']);

        $this->assertStringNotContainsString($sentinelMessage, $response->content());
        $this->assertStringNotContainsString('SECRET_DB', $response->content());
    }

    /** @test */
    public function it_returns_unauthorized_spelled_correctly(): void
    {
        User::factory()->create([
            'email' => 'spell@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'spell@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Unauthorized']);

        $this->assertStringNotContainsString('Unathorized', $response->content());
    }

    /** @test */
    public function it_returns_401_on_unauthenticated_user_endpoint(): void
    {
        $response = $this->getJson('/api/v1/user');

        $response->assertStatus(401);
    }
}
