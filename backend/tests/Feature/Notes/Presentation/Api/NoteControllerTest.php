<?php
// filepath: backend/tests/Feature/Notes/Presentation/Api/NoteControllerUpdateTest.php

namespace Tests\Feature\Notes\Presentation\Api;

use App\Notes\Application\Services\NoteApplicationService;
use App\Notes\Application\DTOs\UpdateNoteDTO;
use App\Notes\Domain\Services\NoteContentStripper;
use App\Models\User;
use App\Notes\Application\DTOs\CreateNoteDTO;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
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
		
		// Create user once per test class
		$this->user = User::factory()->create();
		
		// Mock the application service
		$this->mockNoteAppService = Mockery::mock(NoteApplicationService::class);
		$this->mockContentStripper = Mockery::mock(NoteContentStripper::class);
		
		// Bind mocks to container
		$this->app->instance(NoteApplicationService::class, $this->mockNoteAppService);
		$this->app->instance(NoteContentStripper::class, $this->mockContentStripper);
	}
	
	/** @test */
	public function it_validates_title_format_when_creating_note(): void
	{
		// Test cases for invalid titles
		$invalidTitles = [
			'-invalid-start',      // starts with dash
			'invalid-end-',        // ends with dash
			'invalid--double',     // consecutive dashes
			'invalid@special',     // invalid characters
			'',                    // empty
			'       ',             // empty with spaces
			str_repeat('a', 51),   // too long
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
		// Mock the content stripper
		$this->mockContentStripper
		->shouldReceive('stripMarkdownToText')
		->with('Test content')
		->andReturn('Test content');
		
		// Mock successful update
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

		// Mock the content stripper
		$this->mockContentStripper
		->shouldReceive('stripMarkdownToText')
		->with('Test content')
		->andReturn('Test content');

		// Mock successful update
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

		// Test invalid title formats
		$invalidTitles = [
			'-invalid-start',      // starts with dash
			'invalid-end-',        // ends with dash
			'invalid--double',     // consecutive dashes
			'invalid@special',     // invalid characters
			str_repeat('a', 51),   // too long
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
	
	// /** @test */
	// public function it_accepts_valid_title_format_when_updating_note(): void
	// {
	// 	// Mock the content stripper
	// 	$this->mockContentStripper
	// 	->shouldReceive('stripMarkdownToText')
	// 	->with('Test content')
	// 	->andReturn('Test content');
		
	// 	// Mock successful update
	// 	$this->mockNoteAppService
	// 	->shouldReceive('updateNote')
	// 	->once()
	// 	->with(
	// 		1,
	// 		$this->user->id,
	// 		Mockery::type(UpdateNoteDTO::class)
	// 		)
	// 		->andReturn(['id' => 1, 'title' => 'valid-title', 'content' => 'Test content']);
			
	// 		$response = $this->actingAs($this->user)
	// 		->putJson('/api/v1/notes/1', [
	// 			'title' => 'valid-title',
	// 			'content' => 'Test content'
	// 		]);
			
	// 		$response->assertStatus(200)
	// 		->assertJson([
	// 			'id' => 1,
	// 			'title' => 'valid-title',
	// 			'content' => 'Test content'
	// 		]);
	// 	}
		
	// 	/** @test */
	// 	// public function it_allows_nullable_title_when_updating_note(): void
	// 	// {
	// 	// 	// Mock the content stripper
	// 	// 	$this->mockContentStripper
	// 	// 		->shouldReceive('stripMarkdownToText')
	// 	// 		->with('Test content')
	// 	// 		->andReturn('Test content');
		
	// 	// 	// Mock successful update with null title
	// 	// 	$this->mockNoteAppService
	// 	// 		->shouldReceive('updateNote')
	// 	// 		->once()
	// 	// 		->with(
	// 	// 			1,
	// 	// 			$this->user->id,
	// 	// 			Mockery::on(function (UpdateNoteDTO $dto) {
	// 	// 				return $dto->title === null;
	// 	// 			})
	// 	// 		)
	// 	// 		->andReturn(['id' => 1, 'content' => 'Test content']);
		
	// 	// 	$response = $this->actingAs($this->user)
	// 	// 		->putJson('/api/v1/notes/1', [
	// 	// 			'content' => 'Test content'
	// 	// 			// No title provided
	// 	// 		]);
		
	// 	// 	$response->assertStatus(200);
	// 	// }
		
		/** @test */
		public function it_handles_application_service_exceptions(): void
		{
			$this->mockContentStripper
			->shouldReceive('stripMarkdownToText')
			->andReturn('Test content');
			
			// Mock application service throwing exception
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
		
		protected function tearDown(): void
		{
			Mockery::close();
			parent::tearDown();
		}
	}
	