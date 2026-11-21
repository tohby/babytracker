<?php

namespace App\Http\Controllers\Api\V1;

use App\Auth\EmailCodes;
use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DeleteAccountRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Baby;
use App\Models\Device;
use App\Models\EmailAuthCode;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\AccountDeletionCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
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

    public function sendDeleteCode(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->password !== null) {
            throw new ApiException('password_required', Response::HTTP_CONFLICT);
        }

        $device = $this->requireDevice($request);
        $code = DB::transaction(function () use ($user, $device): string {
            $current = User::query()->whereKey($user->id)->lockForUpdate()->first();
            if (! $current) {
                throw new ApiException('device_revoked', Response::HTTP_UNAUTHORIZED);
            }
            if ($current->password !== null) {
                throw new ApiException('password_required', Response::HTTP_CONFLICT);
            }

            return EmailCodes::issue($current->email, EmailAuthCode::DELETE_ACCOUNT, $current->id, $current->locale, scope: $device->id);
        }, attempts: 3);

        Notification::route('mail', $user->email)->notify((new AccountDeletionCode($code))->locale($user->locale ?? 'en'));

        return response()->json(['status' => 'verification_sent'], Response::HTTP_ACCEPTED);
    }

    /**
     * Delete the account and everything only this account can see (App Store rule, GDPR erasure).
     * Babies shared with someone else stay with them; this user is just removed.
     */
    public function destroy(DeleteAccountRequest $request): Response
    {
        $user = $request->user();
        $device = null;
        if ($user->password === null) {
            $device = $this->requireDevice($request);
        } else {
            $this->confirmPassword($request);
        }

        $failure = DB::transaction(function () use ($request, $user, $device): ?ApiException {
            if ($device) {
                $current = User::query()->whereKey($user->id)->lockForUpdate()->first();
                if (! $current) {
                    return new ApiException('device_revoked', Response::HTTP_UNAUTHORIZED);
                }
                if ($current->password !== null) {
                    return new ApiException('password_required', Response::HTTP_CONFLICT);
                }

                $challenge = EmailCodes::claim($current->email, EmailAuthCode::DELETE_ACCOUNT, $request->string('code'), $device->id);
                if ($challenge instanceof ApiException) {
                    return $challenge;
                }
            }

            $user->babies()->withCount('users')->withTrashed()->get()->each(function (Baby $baby) use ($user) {
                $baby->users_count > 1 ? $baby->users()->detach($user) : $baby->forceDelete();
            });

            $user->tokens()->delete();
            PendingRegistration::where('email', $user->email)->delete();
            EmailAuthCode::where('email', $user->email)->delete();
            Password::broker()->getRepository()->delete($user);
            $user->delete(); // Devices, refresh tokens and onboarding progress cascade.

            return null;
        }, attempts: 3);

        if ($failure) {
            throw $failure;
        }

        if ($user->avatar_path) {
            Storage::disk('local')->deleteDirectory(dirname($user->avatar_path));
        }

        return response()->noContent();
    }

    private function requireDevice(Request $request): Device
    {
        $device = $this->currentDevice($request);
        if (! $device || $device->user_id !== $request->user()->id) {
            throw new ApiException('device_revoked', Response::HTTP_UNAUTHORIZED);
        }

        return $device;
    }
}
