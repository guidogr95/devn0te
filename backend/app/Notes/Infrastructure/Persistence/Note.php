<?php

namespace App\Notes\Infrastructure\Persistence;

use App\Notes\Domain\Enums\NoteSharingType;
use App\Models\User;
use Database\Factories\NoteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
	/** @use HasFactory<NoteFactory> */
	use HasFactory;

	protected $fillable = [
		'title',
		'content',
		'user_id',
		'sharing_type',
		'sharing_url',
		'sharing_password',
		'searchable_text',
		'preview'
	];

	protected $casts = [
		'title' => 'string',
		'content' => 'string',
		'searchable_text' => 'string',
		'preview' => 'string',
		'sharing_type' => NoteSharingType::class
	];

	public static function rules(): array
	{
		return [
			'title' => [
				'required',
				'string',
				'max:50',
				'regex:/^[a-zA-Z0-9_-]+$/',
				'not_regex:/^-/',
				'not_regex:/-$/',
				'not_regex:/--/',
			],
			'content' => 'nullable|string',
			'user_id' => 'required|exists:users,id'
		];
	}

	public function updateContent(
		?string $title,
		?string $content,
		?string $searchableText,
		?string $preview
	): void
	{
		if ($title && $title !== null && trim($title) !== '') {
			$this->title = $title;
    }
		$this->content = $content;
		$this->searchable_text = $searchableText;
		$this->preview = $preview;
	}

	public function changeSharingType(NoteSharingType $sharingType, ?string $password = null): void
	{
		$this->sharing_type = $sharingType;

		if ($sharingType === NoteSharingType::PASSWORD_PROTECTED && $password) {
			$this->sharing_password = bcrypt($password);
		} else {
			$this->sharing_password = null;
		}

	}

	/**
	 * Get the user that owns the note.
	 *
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, Note>
	 */
	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}
}
