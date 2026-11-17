<?php

namespace App\Models;

use Database\Factories\BabyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property Carbon $birth_date
 * @property string $timezone
 * @property string|null $feeding_method
 * @property string|null $usual_wake_time
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['name', 'birth_date', 'timezone', 'feeding_method', 'usual_wake_time'])]
class Baby extends Model
{
    /** @use HasFactory<BabyFactory> */
    use HasFactory, HasUlids, SoftDeletes;

    public const ROLE_OWNER = 'owner';

    public const ROLE_CAREGIVER = 'caregiver';

    public const FEEDING_METHODS = ['breast_milk', 'formula', 'combination', 'solids'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    /**
     * Everyone who can see and log for this baby.
     *
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }
}
