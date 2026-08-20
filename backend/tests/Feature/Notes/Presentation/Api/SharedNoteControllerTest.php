<?php

namespace Tests\Feature\Notes\Presentation\Api;

use App\Models\User;
use App\Notes\Domain\Enums\NoteSharingType;
use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SharedNoteControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_returns_200_with_note_for_public_share(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'public-note',
            'content' => 'public content',
            'user_id' => $owner->id,
            'sharing_type' => 'public',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertOk()
            ->assertJsonPath('title', 'public-note');
    }

    /** @test */
    public function it_returns_200_with_note_for_public_share_as_owner(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'owner-public-note',
            'content' => 'content',
            'user_id' => $owner->id,
            'sharing_type' => 'public',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertOk()
            ->assertJsonPath('title', 'owner-public-note');
    }

    /** @test */
    public function it_returns_401_code_1001_for_password_protected_note_without_password(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'pw-note',
            'content' => 'protected content',
            'user_id' => $owner->id,
            'sharing_type' => 'password_protected',
            'sharing_url' => Str::uuid()->toString(),
            'sharing_password' => bcrypt('secret'),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertStatus(401)
            ->assertJsonPath('code', 1001);
    }

    /** @test */
    public function it_returns_401_code_1002_for_password_protected_note_with_wrong_password(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'pw-note-wrong',
            'content' => 'protected content',
            'user_id' => $owner->id,
            'sharing_type' => 'password_protected',
            'sharing_url' => Str::uuid()->toString(),
            'sharing_password' => bcrypt('secret'),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url.'?sharing_password=wrongpassword');

        $response->assertStatus(401)
            ->assertJsonPath('code', 1002);
    }

    /** @test */
    public function it_returns_200_with_note_for_password_protected_note_with_correct_password(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'pw-note-correct',
            'content' => 'protected content',
            'user_id' => $owner->id,
            'sharing_type' => 'password_protected',
            'sharing_url' => Str::uuid()->toString(),
            'sharing_password' => bcrypt('secret'),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url.'?sharing_password=secret');

        $response->assertOk()
            ->assertJsonPath('title', 'pw-note-correct');
    }

    /** @test */
    public function it_returns_200_for_password_protected_note_as_owner_without_password(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'pw-owner-note',
            'content' => 'protected content',
            'user_id' => $owner->id,
            'sharing_type' => 'password_protected',
            'sharing_url' => Str::uuid()->toString(),
            'sharing_password' => bcrypt('secret'),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertOk()
            ->assertJsonPath('title', 'pw-owner-note');
    }

    /** @test */
    public function it_returns_401_code_1003_for_private_note_as_non_owner(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'private-note',
            'content' => 'private content',
            'user_id' => $owner->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertStatus(401)
            ->assertJsonPath('code', 1003);
    }

    /** @test */
    public function it_returns_200_for_private_note_as_owner(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'private-owner-note',
            'content' => 'private content',
            'user_id' => $owner->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->getJson('/api/v1/shared-notes/'.$note->sharing_url);

        $response->assertOk()
            ->assertJsonPath('title', 'private-owner-note');
    }

    /** @test */
    public function it_returns_404_for_unknown_sharing_url(): void
    {
        $unknownUrl = Str::uuid()->toString();

        $response = $this->getJson('/api/v1/shared-notes/'.$unknownUrl);

        $response->assertStatus(404)
            ->assertJsonPath('error', 'Note not found.');
    }

    /** @test */
    public function it_returns_422_code_1001_for_password_protected_share_without_password(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'share-test',
            'content' => 'content',
            'user_id' => $owner->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->postJson('/api/v1/notes/'.$note->id.'/share', [
                'sharing_type' => 'password_protected',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('code', 1001);
    }

    /** @test */
    public function it_returns_404_when_sharing_a_nonexistent_note(): void
    {
        $owner = User::factory()->create();

        $response = $this->actingAs($owner)
            ->postJson('/api/v1/notes/9999/share', [
                'sharing_type' => 'public',
            ]);

        $response->assertStatus(404)
            ->assertJsonPath('error', 'Note not found.');
    }

    /** @test */
    public function it_returns_200_when_sharing_a_note_as_public(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'share-public-test',
            'content' => 'content',
            'user_id' => $owner->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->postJson('/api/v1/notes/'.$note->id.'/share', [
                'sharing_type' => 'public',
            ]);

        $response->assertOk()
            ->assertJsonPath('sharing_type', 'public')
            ->assertJsonStructure(['sharing_url']);
    }

    /** @test */
    public function it_unshares_sets_type_to_private_and_clears_url(): void
    {
        $owner = User::factory()->create();

        $note = Note::create([
            'title' => 'unshare-test',
            'content' => 'content',
            'user_id' => $owner->id,
            'sharing_type' => 'public',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($owner)
            ->deleteJson('/api/v1/notes/'.$note->id.'/share');

        $response->assertOk();

        $dbNote = Note::find($note->id);
        $this->assertNotNull($dbNote);
        $this->assertEquals(NoteSharingType::PRIVATE, $dbNote->sharing_type);
        $this->assertNull($dbNote->sharing_url);
        $this->assertNull($dbNote->sharing_password);
    }

    /** @test */
    public function it_returns_404_for_other_users_note_on_unshare(): void
    {
        $ownerA = User::factory()->create();
        $ownerB = User::factory()->create();

        $note = Note::create([
            'title' => 'owner-a-note',
            'content' => 'content',
            'user_id' => $ownerA->id,
            'sharing_type' => 'public',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $response = $this->actingAs($ownerB)
            ->deleteJson('/api/v1/notes/'.$note->id.'/share');

        $response->assertStatus(404)
            ->assertJsonPath('error', 'Note not found.');
    }

    /** @test */
    public function it_stores_zero_password_as_bcrypt_hash_and_verifies_successfully(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();

        $note = Note::create([
            'title' => 'zero-pw-test',
            'content' => 'zero password content',
            'user_id' => $owner->id,
            'sharing_type' => 'private',
            'sharing_url' => Str::uuid()->toString(),
            'connector_id' => (string) Str::uuid(),
        ]);

        $shareResponse = $this->actingAs($owner)
            ->postJson('/api/v1/notes/'.$note->id.'/share', [
                'sharing_type' => 'password_protected',
                'sharing_password' => '0',
            ]);

        $shareResponse->assertOk()
            ->assertJsonPath('sharing_type', 'password_protected');

        $dbNote = Note::find($note->id);
        $this->assertNotNull($dbNote);
        $this->assertNotNull($dbNote->sharing_password);
        $this->assertTrue(password_verify('0', $dbNote->sharing_password));

        $getResponse = $this->actingAs($visitor)
            ->getJson('/api/v1/shared-notes/'.$dbNote->sharing_url.'?sharing_password=0');

        $getResponse->assertOk()
            ->assertJsonPath('title', 'zero-pw-test')
            ->assertJsonPath('content', 'zero password content');
    }
}
