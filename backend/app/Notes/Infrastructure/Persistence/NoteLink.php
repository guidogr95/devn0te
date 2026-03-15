<?php

namespace App\Notes\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Model;

class NoteLink extends Model
{
	protected $table = 'note_links';

	protected $fillable = [
		'source_note_id',
		'target_note_id',
	];

	public $timestamps = true;
}