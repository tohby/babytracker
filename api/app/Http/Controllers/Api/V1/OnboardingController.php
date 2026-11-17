<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateOnboardingRequest;
use App\Models\OnboardingProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Where the user is in onboarding. Answers are saved where they belong: the baby through
 * /babies, the parent's name through PATCH /me. Before sign-up, the app keeps answers on the phone.
 */
class OnboardingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return $this->progress($request->user());
    }

    public function update(UpdateOnboardingRequest $request): JsonResponse
    {
        OnboardingProgress::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['last_step' => $request->string('last_step')->value()],
        );

        return $this->progress($request->user());
    }

    public function complete(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->babies()->exists()) {
            throw new ApiException('baby_required', 422);
        }

        $steps = config('nappa.onboarding_steps');
        OnboardingProgress::updateOrCreate(
            ['user_id' => $user->id],
            ['last_step' => end($steps), 'completed_at' => now()],
        );

        return $this->progress($user);
    }

    private function progress(User $user): JsonResponse
    {
        $progress = $user->onboardingProgress()->first();

        return response()->json(['data' => [
            'last_step' => $progress?->last_step,
            'completed_at' => $progress?->completed_at?->toIso8601String(),
        ]]);
    }
}
