<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Baby;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Baby */
class BabyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'birth_date' => $this->birth_date->toDateString(),
            'timezone' => $this->timezone,
            'feeding_method' => $this->feeding_method,
            'usual_wake_time' => $this->usual_wake_time ? substr($this->usual_wake_time, 0, 5) : null,
            // The signed-in user's role for this baby, when loaded through user->babies().
            'role' => $this->whenPivotLoaded('baby_user', fn () => $this->pivot->role),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
