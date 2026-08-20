<?php

namespace App\Notes\Infrastructure\Persistence;

use Illuminate\Database\Eloquent\Model;

class DeviceSyncCursor extends Model {
	protected $table = 'device_sync_cursors';
	protected $fillable = ['user_id', 'device_id', 'last_synced_at'];
	protected $casts = ['last_synced_at' => 'datetime'];
}
