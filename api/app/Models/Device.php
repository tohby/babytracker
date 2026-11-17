<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * A phone signed in to an account ("remembered device").
 *
 * @property string $id
 * @property int $user_id
 * @property string $secret_hash
 * @property string|null $platform
 * @property string|null $pin_hash
 * @property int $pin_failed_attempts
 * @property CarbonImmutable|null $last_used_at
 * @property CarbonImmutable|null $revoked_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Device extends Model
{
    use HasUlids, Prunable;

    /** Devices unused for this long are forgotten; the next sign-in on that phone needs the email again. */
    public const STALE_AFTER_DAYS = 180;

    public const PIN_MAX_ATTEMPTS = 5;

    protected $hidden = ['secret_hash', 'pin_hash'];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<RefreshToken, $this> */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /** @return HasMany<PersonalAccessToken, $this> */
    public function accessTokens(): HasMany
    {
        return $this->hasMany(PersonalAccessToken::class);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function hasPin(): bool
    {
        return $this->pin_hash !== null;
    }

    /**
     * Revoked devices and devices unused for STALE_AFTER_DAYS.
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()
            ->whereNotNull('revoked_at')
            ->orWhere('last_used_at', '<', now()->subDays(self::STALE_AFTER_DAYS));
    }
}
