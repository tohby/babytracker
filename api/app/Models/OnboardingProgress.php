<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $user_id
 * @property string $last_step
 * @property CarbonImmutable|null $completed_at
 * @property CarbonImmutable|null $updated_at
 */
class OnboardingProgress extends Model
{
    public const CREATED_AT = null;

    protected $table = 'onboarding_progress';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }
}
