<?php

namespace App\Http\Controllers\Api\V1;

use App\Auth\DeviceSessions;
use App\Auth\EmailCodes;
use App\Auth\Passwords;
use App\Auth\SignInThrottle;
use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdatePasswordRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Device;
use App\Models\EmailAuthCode;
use App\Models\User;
use App\Notifications\PasswordChangeCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

/** Settings › Security & Sign-In › Change (or set) password. */
class AccountPasswordController extends Controller
{
    public function __construct(private readonly DeviceSessions $sessions) {}

    /** Email code for a forgotten current password, or for setting a first password. Scoped to this phone. */
    public function sendCode(Request $request): JsonResponse
    {
        $user = $request->user();
        $device = $this->requireDevice($request);
        $code = EmailCodes::issue($user->email, EmailAuthCode::CHANGE_PASSWORD, $user->id, $user->locale, scope: $device->id);

        Notification::route('mail', $user->email)->notify((new PasswordChangeCode($code))->locale($user->locale ?? 'en'));

        return response()->json(['status' => 'verification_sent'], Response::HTTP_ACCEPTED);
    }

    /**
     * Save the new password and sign out every other phone; this one stays signed in.
     */
    public function update(UpdatePasswordRequest $request): UserResource
    {
        $user = $request->user();
        $device = $this->requireDevice($request);
        $useCode = $request->filled('code');

        if (! $useCode) {
            if ($user->password === null) {
                throw new ApiException('code_required', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $keys = [SignInThrottle::emailKey($user->email)];
            $throttle = app(SignInThrottle::class);
            $throttle->ensureAllowed($keys);
            if (! Passwords::check($user, (string) $request->input('current_password'))) {
                $throttle->hit($keys);
                throw new ApiException('invalid_credentials', Response::HTTP_UNAUTHORIZED);
            }
            $throttle->clear($keys);
        }

        // Claim the code in the same transaction as the change; report failures after commit so guesses count.
        $failure = DB::transaction(function () use ($request, $user, $device, $useCode): ?ApiException {
            $current = User::query()->whereKey($user->id)->lockForUpdate()->first();
            if (! $current) {
                return new ApiException('device_revoked', Response::HTTP_UNAUTHORIZED);
            }
            if ($useCode) {
                $challenge = EmailCodes::claim($current->email, EmailAuthCode::CHANGE_PASSWORD, $request->string('code'), $device->id);
                if ($challenge instanceof ApiException) {
                    return $challenge;
                }
            }

            $current->forceFill(['password' => Hash::make($request->string('password'))])->save();
            $this->sessions->revokeOthers($current, $device);
            Password::broker()->getRepository()->delete($current);

            return null;
        }, attempts: 3);

        if ($failure) {
            throw $failure;
        }

        return new UserResource($user->fresh()->load('onboardingProgress'));
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
