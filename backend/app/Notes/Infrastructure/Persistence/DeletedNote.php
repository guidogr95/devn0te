<?php

namespace App\Notes\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Model;

class DeletedNote extends Model
{
	public $timestamps = false;
	protected $table = 'deleted_notes';
	protected $fillable = [
		'note_id',
		'user_id',
		'deleted_at'
	];

	protected $casts = [
		'note_id' => 'integer',
		'user_id' => 'integer',
		'deleted_at' => 'datetime'
	];

}
