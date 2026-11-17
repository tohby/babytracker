<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

/**
 * A sign-up waiting for its email code.
 *
 * @property string $id
 * @property string $email
 * @property string $password_hash
 * @property string|null $locale
 * @property CarbonImmutable $consented_at
 * @property string $code_hash
 * @property int $attempts
 * @property CarbonImmutable $expires_at
 */
class PendingRegistration extends Model
{
    use HasUlids, Prunable;

    public const CODE_TTL_MINUTES = 15;

    public const MAX_ATTEMPTS = 5;

    protected $guarded = [];

    protected $hidden = ['password_hash', 'code_hash'];

    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now());
    }
}
