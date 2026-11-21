<?php

namespace App\Http\Resources\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin User */
class UserResource extends JsonResource
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
            'email' => $this->email,
            'email_verified' => $this->email_verified_at !== null,
            'has_password' => $this->password !== null,
            'locale' => $this->locale,
            // Short-lived signed link to the private file; null means the app shows the initials chip.
            'avatar_url' => $this->avatar_path
                ? Storage::disk('local')->temporaryUrl($this->avatar_path, now()->addMinutes((int) config('nappa.avatar.url_minutes')))
                : null,
            'onboarding' => [
                'last_step' => $this->onboardingProgress?->last_step,
                'completed' => $this->onboardingProgress?->completed_at !== null,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
