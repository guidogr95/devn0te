<?php

namespace App\Connectors\Infrastructure\Persistence;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Connector extends Model
{
	protected $fillable = [
		'user_id',
		'type',
		'settings',
	];

	protected $casts = [
		'settings' => 'array',
	];

	public function user(): BelongsTo
	{
		return $this->belongsTo(User::class);
	}
}
