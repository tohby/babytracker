<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id', 'baby_id', 'type', 'occurred_at', 'ended_at', 'payload', 'note', 'deleted_at', 'change_number', 'logged_by'])]
class BabyEvent extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'ended_at' => 'datetime',
            'deleted_at' => 'datetime',
            'payload' => 'object',
            'change_number' => 'integer',
        ];
    }
}
