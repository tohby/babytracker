<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

/**
 * @property string $email
 * @property string $intent
 * @property int|null $user_id
 * @property string|null $locale
 * @property CarbonImmutable|null $consented_at
 * @property string $code_hash
 * @property int $attempts
 * @property CarbonImmutable $expires_at
 */
class EmailAuthCode extends Model
{
    use HasUlids, Prunable;

    public const SIGN_IN = 'sign_in';

    public const CREATE_ACCOUNT = 'create_account';

    public const DELETE_ACCOUNT = 'delete_account';

    public const CODE_TTL_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** @return Builder<static> */
    public function prunable(): Builder
    {
        return static::query()->where('expires_at', '<', now());
    }
}
