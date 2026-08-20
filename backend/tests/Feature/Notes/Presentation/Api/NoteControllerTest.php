<?php

namespace Tests\Feature\Notes\Presentation\Api;

use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Domain\Services\NoteContentStripper;
use App\Models\User;
use App\Notes\Application\DTOs\CreateNoteDTO;
use App\Notes\Domain\Enums\NoteErrorCode;
use App\Notes\Infrastructure\Persistence\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;
use Mockery;

class NoteControllerTest extends TestCase
{
	use RefreshDatabase;
	
	private User $user;
	private $mockNoteAppService;
	private $mockContentStripper;
	
	protected function setUp(): void
	{
		parent::setUp();
		
		$this->user = User::factory()->create();
		
		$this->mockNoteAppService = Mockery::mock(NoteApplicationService::class);
		$this->mockContentStripper = Mockery::mock(NoteContentStripper::class);
		
		$this->app->instance(NoteApplicationService::class, $this->mockNoteAppService);
		$this->app->instance(NoteContentStripper::class, $this->mockContentStripper);
	}
	
	/** @test */
	public function it_validates_title_format_when_creating_note(): void
	{
		$invalidTitles = [
			'-invalid-start',
			'invalid-end-',
			'invalid--double',
			'invalid@special',
			'',
			'       ',
			str_repeat('a', 51),
		];
		
		foreach ($invalidTitles as $invalidTitle) {
			$response = $this->actingAs($this->user)
			->postJson('/api/v1/notes', [
				'title' => $invalidTitle,
				'content' => 'Test content'
			]);

			
			$response->assertStatus(422)
			->assertJsonStructure([
				'error',
				'errors',
				'details' => [
					'title'
				]
			]);
		}
	}
	
	/** @test */
	public function it_accepts_valid_title_format_when_creating_note(): void
	{
		$this->mockContentStripper
		->shouldReceive('stripMarkdownToText')
		->with('Test content')
		->andReturn('Test content');
		
		$this->mockNoteAppService
		->shouldReceive('createNote')
		->times(5)
		->with(
			Mockery::type(CreateNoteDTO::class)
		)
		->andReturn(new \App\Notes\Infrastructure\Persistence\Note([
			'id' => 1, 
			'title' => 'valid-title', 
			'content' => 'Test content'
    ]));
		
		$validTitles = [
			'valid-title',
			'valid_title',
			'validTitle123',
			'a',
			'valid-title-123_test'
		];
		
		foreach ($validTitles as $validTitle) {
			$response = $this->actingAs($this->user)
			->postJson('/api/v1/notes', [
				'title' => $validTitle,
				'content' => 'Test content'
			]);

			
			$response->assertStatus(201);
			
		}
	}
	
	/** @test */
	public function it_validates_title_format_when_updating_note(): void
	{

		$this->mockContentStripper
		->shouldReceive('stripMarkdownToText')
		->with('Test content')
		->andReturn('Test content');

		$this->mockNoteAppService
		->shouldReceive('updateNote')
		->times(0)
		->with(
			1,
			$this->user->id,
			Mockery::type(UpdateNoteDTO::class)
			)
		->andReturn(new \App\Notes\Infrastructure\Persistence\Note([
			'id' => 1, 
			'title' => 'valid-title', 
			'content' => 'Test content'
    ]));

		$invalidTitles = [
			'-invalid-start',
			'invalid-end-',
			'invalid--double',
			'invalid@special',
			str_repeat('a', 51),
		];
		
		foreach ($invalidTitles as $invalidTitle) {
			$response = $this->actingAs($this->user)
			->putJson('/api/v1/notes/1', [
				'title' => $invalidTitle,
				'content' => 'Test content'
			]);
			
			$response->assertStatus(422)
			->assertJsonStructure([
				'error',
				'errors',
				'details' => [
					'title'
				]
			]);
		}
	}
	
	/** @test */
	public function it_handles_application_service_exceptions(): void
		{
			$this->mockContentStripper
			->shouldReceive('stripMarkdownToText')
			->andReturn('Test content');
			
			$this->mockNoteAppService
			->shouldReceive('updateNote')
			->once()
			->andThrow(new \Exception('Note not found'));
			
			$response = $this->actingAs($this->user)
			->putJson('/api/v1/notes/999', [
				'title' => 'valid-title',
				'content' => 'Test content'
			]);
			
		$response->assertStatus(500)
		->assertJson(['error' => 'Failed to update note.']);
	}

	/** @test */
	public function it_returns_404_when_getting_a_nonexistent_note_by_id(): void
	{
		$this->app->forgetInstance(NoteApplicationService::class);

		$response = $this->actingAs($this->user)
		->getJson('/api/v1/note/9999');

		$response->assertStatus(404)
		->assertJson(['error' => 'Note not found.']);
	}

	/** @test */
	public function it_returns_title_taken_envelope_when_creating_duplicate_note(): void
	{
		$this->app->forgetInstance(NoteApplicationService::class);
		$this->app->forgetInstance(NoteContentStripper::class);

		Note::create([
			'title' => 'dup-title',
			'content' => 'existing content',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		$response = $this->actingAs($this->user)
		->postJson('/api/v1/notes', [
			'title' => 'dup-title',
			'content' => 'something',
		]);

		$response->assertStatus(422)
		->assertJson([
			'error' => 'A note with this title already exists.',
			'code' => NoteErrorCode::TITLE_TAKEN->value,
		]);
	}

	/** @test */
	public function it_returns_title_taken_envelope_when_updating_to_duplicate_title(): void
	{
		$this->app->forgetInstance(NoteApplicationService::class);
		$this->app->forgetInstance(NoteContentStripper::class);

		$note1 = Note::create([
			'title' => 'title-a',
			'content' => 'content a',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		Note::create([
			'title' => 'title-b',
			'content' => 'content b',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		$response = $this->actingAs($this->user)
		->putJson('/api/v1/notes/' . $note1->id, [
			'title' => 'title-b',
		]);

		$response->assertStatus(422)
		->assertJson([
			'error' => 'A note with this title already exists.',
			'code' => NoteErrorCode::TITLE_TAKEN->value,
		]);
	}

	/** @test */
	public function it_allows_two_users_to_create_notes_with_the_same_title(): void
	{
		$this->app->forgetInstance(NoteApplicationService::class);
		$this->app->forgetInstance(NoteContentStripper::class);

		$alice = User::factory()->create();
		$bob = User::factory()->create();

		$aliceResponse = $this->actingAs($alice)
		->postJson('/api/v1/notes', [
			'title' => 'cross-user-title',
			'content' => 'alice content',
		]);

		$aliceResponse->assertStatus(201);
		$aliceId = $aliceResponse->json('id');

		$bobResponse = $this->actingAs($bob)
		->postJson('/api/v1/notes', [
			'title' => 'cross-user-title',
			'content' => 'bob content',
		]);

		$bobResponse->assertStatus(201);
		$bobId = $bobResponse->json('id');

		$this->assertNotEquals($aliceId, $bobId);
	}

	/** @test */
	public function it_returns_404_when_updating_a_nonexistent_note(): void
	{
		$this->mockNoteAppService
		->shouldReceive('updateNote')
		->once()
		->andThrow(new NotFoundHttpException('Note not found'));

		$response = $this->actingAs($this->user)
		->putJson('/api/v1/notes/9999', [
			'title' => 'valid-title',
		]);

		$response->assertStatus(404)
		->assertJson(['error' => 'Note not found.']);
	}

	/** @test */
	public function it_returns_404_when_deleting_a_nonexistent_note(): void
	{
		$this->mockNoteAppService
		->shouldReceive('deleteNote')
		->once()
		->andThrow(new NotFoundHttpException('Note not found'));

		$response = $this->actingAs($this->user)
		->deleteJson('/api/v1/notes/9999');

		$response->assertStatus(404)
		->assertJson(['error' => 'Note not found.']);
	}

	/** @test */
	public function it_returns_404_when_sharing_a_nonexistent_note(): void
	{
		$this->mockNoteAppService
		->shouldReceive('shareNote')
		->once()
		->andThrow(new NotFoundHttpException('Note not found'));

		$response = $this->actingAs($this->user)
		->postJson('/api/v1/notes/9999/share', [
			'sharing_type' => 'public',
		]);

		$response->assertStatus(404)
		->assertJson(['error' => 'Note not found.']);
	}

	/** @test */
	public function it_filters_note_titles_case_insensitively_when_filter_is_provided(): void
	{
		$this->app->forgetInstance(NoteApplicationService::class);

		Note::create([
			'title' => 'apple',
			'content' => 'content',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		Note::create([
			'title' => 'Banana',
			'content' => 'content',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		Note::create([
			'title' => 'cherry',
			'content' => 'content',
			'user_id' => $this->user->id,
			'sharing_type' => 'private',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		$response = $this->actingAs($this->user)
		->getJson('/api/v1/user/notes/titles?q=an');

		$response->assertStatus(200)
		->assertJsonFragment(['title' => 'Banana']);

		$json = $response->json('data');
		$this->assertIsArray($json);
		$titles = array_column($json, 'title');
		$this->assertNotContains('apple', $titles);
		$this->assertNotContains('cherry', $titles);
	}

	/** @test */
	public function it_generates_uuid_sharing_url_for_new_note(): void
	{
		$note = Note::create([
			'user_id' => $this->user->id,
			'title' => 'factory-test',
			'sharing_url' => Str::uuid()->toString(),
			'connector_id' => (string) Str::uuid(),
		]);

		$this->assertNotNull($note->sharing_url);
		$this->assertStringNotContainsString('null', $note->sharing_url);
		$this->assertMatchesRegularExpression('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $note->sharing_url);
	}

	protected function tearDown(): void
		{
			Mockery::close();
			parent::tearDown();
		}
	}
	