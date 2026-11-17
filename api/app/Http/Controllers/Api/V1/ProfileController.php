<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ConfirmPasswordRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Baby;
use App\Models\PendingRegistration;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * The signed-in user, plus this phone's device (for "PIN on/off" in Settings).
     */
    public function show(Request $request): UserResource
    {
        $device = $this->currentDevice($request);

        return (new UserResource($request->user()->load('onboardingProgress')))->additional([
            'meta' => ['device' => $device ? ['id' => $device->id, 'pin_enabled' => $device->hasPin()] : null],
        ]);
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $request->user()->update($request->validated());

        return new UserResource($request->user()->load('onboardingProgress'));
    }

    /**
     * Delete the account and everything only this account can see (App Store rule, GDPR erasure).
     * Babies shared with someone else stay with them; this user is just removed.
     */
    public function destroy(ConfirmPasswordRequest $request): Response
    {
        $this->confirmPassword($request);
        $user = $request->user();

        DB::transaction(function () use ($user) {
            $user->babies()->withCount('users')->withTrashed()->get()->each(function (Baby $baby) use ($user) {
                $baby->users_count > 1 ? $baby->users()->detach($user) : $baby->forceDelete();
            });

            $user->tokens()->delete();
            PendingRegistration::where('email', $user->email)->delete();
            Password::broker()->getRepository()->delete($user);
            $user->delete(); // Devices, refresh tokens and onboarding progress cascade.
        });

        if ($user->avatar_path) {
            Storage::disk('local')->deleteDirectory(dirname($user->avatar_path));
        }

        return response()->noContent();
    }
}
