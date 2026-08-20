<?php

namespace Tests\Feature\Notes\Presentation\Api;

use App\Models\User;
use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Infrastructure\Persistence\DeviceSyncCursor;
use App\Notes\Infrastructure\Persistence\Note;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Mockery;
use Tests\TestCase;

class SyncControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /** @test */
    public function it_pushes_created_notes(): void
    {
        $user = User::factory()->create();
        $connectorId = (string) Str::uuid();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => $connectorId, 'title' => 'synced-note', 'content' => 'hello'],
                ],
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'created' => [['id', 'connector_id']],
                'errors',
            ])
            ->assertJsonCount(1, 'created');

        $this->assertDatabaseHas('notes', [
            'user_id' => $user->id,
            'connector_id' => $connectorId,
            'title' => 'synced-note',
        ]);
    }

    /** @test */
    public function it_pushes_updated_notes(): void
    {
        $user = User::factory()->create();

        $note = Note::create([
            'title' => 'original',
            'content' => 'content',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'updated' => [
                    ['id' => $note->id, 'title' => 'retitled', 'content' => 'new-content'],
                ],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'retitled',
            'content' => 'new-content',
        ]);
    }

    /** @test */
    public function it_pushes_deleted_notes(): void
    {
        $user = User::factory()->create();
        $connectorId = (string) Str::uuid();

        $note = Note::create([
            'title' => 'to-delete',
            'content' => 'content',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => $connectorId,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'deleted' => [$connectorId],
            ]);

        $response->assertOk();

        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }

    /** @test */
    public function it_silently_skips_unknown_deleted_connector_ids(): void
    {
        $user = User::factory()->create();
        $unknownId = (string) Str::uuid();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'deleted' => [$unknownId],
            ]);

        $response->assertOk();
    }

    /** @test */
    public function it_returns_422_validation_for_malformed_push_payload(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => (string) Str::uuid(), 'title' => ''],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['error', 'errors'])
            ->assertSee('title');
    }

    /** @test */
    public function it_returns_422_title_taken_envelope_on_23505_title(): void
    {
        $user = User::factory()->create();

        $this->app->forgetInstance(NoteApplicationService::class);

        Note::create([
            'title' => 'existing-title',
            'content' => 'content',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => (string) Str::uuid(), 'title' => 'existing-title'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'A note with this title already exists.',
                'code' => NoteErrorCode::TITLE_TAKEN->value,
            ]);
    }

    /** @test */
    public function it_allows_two_users_to_push_notes_with_the_same_title(): void
    {
        $this->app->forgetInstance(NoteApplicationService::class);

        $alice = User::factory()->create();
        $bob = User::factory()->create();

        $aliceConnectorId = (string) Str::uuid();
        $bobConnectorId = (string) Str::uuid();

        $aliceResponse = $this->actingAs($alice)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => $aliceConnectorId, 'title' => 'cross-user-title', 'content' => 'alice content'],
                ],
            ]);

        $aliceResponse->assertOk();
        $aliceId = $aliceResponse->json('created.0.id');

        $bobResponse = $this->actingAs($bob)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => $bobConnectorId, 'title' => 'cross-user-title', 'content' => 'bob content'],
                ],
            ]);

        $bobResponse->assertOk();
        $bobId = $bobResponse->json('created.0.id');

        $this->assertNotEquals($aliceId, $bobId);
    }

    /** @test */
    public function it_returns_422_connector_id_collision_envelope_on_23505_connector_id(): void
    {
        $user = User::factory()->create();

        $this->app->forgetInstance(NoteApplicationService::class);

        $existingConnectorId = (string) Str::uuid();

        Note::create([
            'title' => 'first-note',
            'content' => 'content',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => $existingConnectorId,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => $existingConnectorId, 'title' => 'unique-title'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'A note with this connector_id already exists.',
                'code' => NoteErrorCode::CONNECTOR_ID_COLLISION->value,
            ]);
    }

    /** @test */
    public function it_returns_500_generic_on_unexpected_exception(): void
    {
        $user = User::factory()->create();

        $mockService = Mockery::mock(NoteApplicationService::class);
        $mockService->shouldReceive('createNote') // @phpstan-ignore method.notFound
            ->andReturnUsing(function () {
                throw new \RuntimeException('boom');
            });
        $this->app->instance(NoteApplicationService::class, $mockService);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => (string) Str::uuid(), 'title' => 'test-note'],
                ],
            ]);

        $response->assertStatus(500)
            ->assertJson(['error' => 'Sync push failed.'])
            ->assertJsonMissing(['message' => 'boom']);
    }

    /** @test */
    public function it_returns_delta_notes_for_device_with_cursor(): void
    {
        $user = User::factory()->create();

        $note1 = Note::create([
            'title' => 'note-1',
            'content' => 'c1',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);
        $note2 = Note::create([
            'title' => 'note-2',
            'content' => 'c2',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);
        $note3 = Note::create([
            'title' => 'note-3',
            'content' => 'c3',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        DB::table('deleted_notes')->insert([
            'note_id' => $note1->id,
            'user_id' => $user->id,
            'deleted_at' => Carbon::now(),
        ]);

        $firstResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $firstResponse->assertOk()
            ->assertJsonCount(3, 'notes')
            ->assertJsonCount(1, 'deleted');

        $cursor = DeviceSyncCursor::where('user_id', $user->id)
            ->where('device_id', 'd1')->first();
        $this->assertNotNull($cursor);

        $secondResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $secondResponse->assertOk()
            ->assertJsonCount(0, 'notes')
            ->assertJsonCount(0, 'deleted');
    }

    /** @test */
    public function it_advances_cursor_to_max_observed_timestamp(): void
    {
        $user = User::factory()->create();

        Carbon::setTestNow('2026-01-01 00:00:01');
        $first = Note::create([
            'title' => 'first',
            'content' => 'c1',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        Carbon::setTestNow('2026-01-01 00:00:02');
        $second = Note::create([
            'title' => 'second',
            'content' => 'c2',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        Carbon::setTestNow('2026-01-01 00:00:10');

        $firstResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $firstResponse->assertOk()->assertJsonCount(2, 'notes');

        $cursor = DeviceSyncCursor::where('user_id', $user->id)
            ->where('device_id', 'd1')->first();
        $this->assertNotNull($cursor);
        $this->assertTrue(
            $cursor->last_synced_at->equalTo(Carbon::parse('2026-01-01 00:00:02')),
            'cursor must advance to the max observed timestamp, not the wall clock'
        );

        $backdated = Note::create([
            'title' => 'backdated',
            'content' => 'c3',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);
        Note::query()->where('id', $backdated->id)->update(['updated_at' => '2026-01-01 00:00:05']);

        $secondResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $secondResponse->assertOk()
            ->assertJsonCount(1, 'notes')
            ->assertJsonPath('notes.0.id', $backdated->id);

        Carbon::setTestNow(null);
    }

    /** @test */
    public function it_keeps_cursor_at_epoch_when_no_observations(): void
    {
        $user = User::factory()->create();

        $firstResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $firstResponse->assertOk()
            ->assertJsonCount(0, 'notes')
            ->assertJsonCount(0, 'deleted');

        $cursor = DeviceSyncCursor::where('user_id', $user->id)
            ->where('device_id', 'd1')->first();
        $this->assertNotNull($cursor);
        $this->assertTrue(
            $cursor->last_synced_at->equalTo(Carbon::parse('1970-01-01 00:00:00')),
            'cursor must stay at epoch when no observations'
        );

        $note = Note::create([
            'title' => 'new-note',
            'content' => 'c1',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $secondResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta');

        $secondResponse->assertOk()
            ->assertJsonCount(1, 'notes')
            ->assertJsonPath('notes.0.id', $note->id);
    }

    /** @test */
    public function it_caps_delta_response_at_limit(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 150; $i++) {
            Carbon::setTestNow(Carbon::parse('2026-01-01 00:00:00')->addSeconds($i));
            Note::create([
                'title' => "note-{$i}",
                'content' => "content-{$i}",
                'user_id' => $user->id,
                'sharing_type' => 'private',
                'sharing_url' => Str::uuid()->toString(),
                'connector_id' => (string) Str::uuid(),
            ]);
        }
        Carbon::setTestNow(null);

        $firstResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta?limit=100');

        $firstResponse->assertOk()
            ->assertJsonCount(100, 'notes');

        $secondResponse = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta?limit=100');

        $secondResponse->assertOk()
            ->assertJsonCount(50, 'notes');
    }

    /** @test */
    public function it_rejects_limit_above_500(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withHeader('X-Device-Id', 'd1')
            ->getJson('/api/v1/user/notes/delta?limit=501');

        $response->assertStatus(422);
    }

    /** @test */
    public function it_serializes_cursor_access_under_lock_for_update(): void
    {
        $user = User::factory()->create();

        DB::transaction(function () use ($user) {
            DeviceSyncCursor::query()->insertOrIgnore([
                'user_id' => $user->id, 'device_id' => 'd1',
                'last_synced_at' => '1970-01-01 00:00:00',
            ]);
            $cursor = DeviceSyncCursor::where('user_id', $user->id)
                ->where('device_id', 'd1')->lockForUpdate()->firstOrFail();
            $cursor->update(['last_synced_at' => '2026-01-01 00:00:02']);
        });

        DB::transaction(function () use ($user) {
            $cursor = DeviceSyncCursor::where('user_id', $user->id)
                ->where('device_id', 'd1')->lockForUpdate()->firstOrFail();
            $this->assertTrue(
                $cursor->last_synced_at->equalTo(Carbon::parse('2026-01-01 00:00:02')),
                'second transaction must observe the committed advance'
            );
        });
    }

    /** @test */
    public function it_updates_notes_by_connector_id_when_local_id_is_unknown(): void
    {
        $user = User::factory()->create();

        $existingConnectorId = (string) Str::uuid();

        $note = Note::create([
            'title' => 'original',
            'content' => 'content',
            'user_id' => $user->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => $existingConnectorId,
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'updated' => [
                    ['id' => 999999, 'connector_id' => $existingConnectorId, 'title' => 'retitled', 'content' => 'new'],
                ],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
            'title' => 'retitled',
            'content' => 'new',
        ]);
    }

    /** @test */
    public function it_skips_unknown_updated_notes_without_aborting_the_batch(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/user/notes/sync/push', [
                'created' => [
                    ['connector_id' => (string) Str::uuid(), 'title' => 'valid-create'],
                ],
                'updated' => [
                    ['id' => 999999, 'title' => 'unknown-update'],
                ],
            ]);

        $response->assertOk()
            ->assertJsonCount(1, 'created');

        $this->assertDatabaseHas('notes', [
            'user_id' => $user->id,
            'title' => 'valid-create',
        ]);
    }
}
