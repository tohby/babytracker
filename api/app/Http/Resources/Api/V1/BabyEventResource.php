<?php

namespace App\Http\Resources\Api\V1;

use App\Models\BabyEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin BabyEvent */
class BabyEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'baby_id' => $this->baby_id,
            'type' => $this->type,
            'occurred_at' => $this->occurred_at->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'payload' => $this->payload,
            'note' => $this->note,
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'change_number' => $this->change_number,
            'logged_by' => $this->logged_by,
            'logged_by_name' => $this->author->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
