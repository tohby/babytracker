<?php

namespace App\Http\Controllers\Api\V1;

use App\Auth\DeviceSessions;
use App\Auth\Passwords;
use App\Auth\SignInThrottle;
use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ConfirmPasswordRequest;
use App\Http\Requests\Api\V1\DeviceLoginRequest;
use App\Http\Requests\Api\V1\ForgetDeviceRequest;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\LogoutRequest;
use App\Http\Requests\Api\V1\PinLoginRequest;
use App\Http\Requests\Api\V1\RefreshRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Device;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

/**
 * Signing in and out on the phone. Sign-up lives in RegistrationController.
 *
 * Successful sign-ins return access + refresh tokens and the device; see DeviceSessions.
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly DeviceSessions $sessions,
        private readonly SignInThrottle $throttle,
    ) {}

    /**
     * Email + password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = User::normalizeEmail($request->string('email'));
        $keys = [SignInThrottle::emailKey($email)];
        $this->throttle->ensureAllowed($keys);

        $user = User::firstWhere('email', $email);

        if (! Passwords::check($user, $request->string('password'))) {
            $this->throttle->hit($keys);
            throw new ApiException('invalid_credentials', 401);
        }

        $this->throttle->clear($keys);

        // Reuse this phone's device when it's already remembered for this account (keeps its PIN).
        $device = $this->sessions->findDevice($request->input('device_id'), $request->input('device_secret'));
        $secret = null;
        if (! $device || $device->user_id !== $user->id) {
            [$device, $secret] = $this->sessions->createDevice($user, $request->input('platform'));
        }

        return $this->signedIn($device, $secret);
    }

    /**
     * Remembered phone, password only. The device tells us which account it is, so no email.
     */
    public function deviceLogin(DeviceLoginRequest $request): JsonResponse
    {
        $device = $this->rememberedDevice($request->string('device_id'), $request->string('device_secret'));
        $keys = $this->throttleKeys($device);
        $this->throttle->ensureAllowed($keys);

        if (! Passwords::check($device->user, $request->string('password'))) {
            $this->throttle->hit($keys);
            throw new ApiException('invalid_credentials', 401);
        }

        $this->throttle->clear($keys);
        $device->forceFill(['pin_failed_attempts' => 0])->save();

        return $this->signedIn($device);
    }

    /**
     * Remembered phone with a PIN. Five wrong PINs turn the PIN off; the password still works.
     */
    public function pinLogin(PinLoginRequest $request): JsonResponse
    {
        $device = $this->rememberedDevice($request->string('device_id'), $request->string('device_secret'));
        $keys = $this->throttleKeys($device);
        $this->throttle->ensureAllowed($keys);

        if (! $device->hasPin()) {
            throw new ApiException('pin_not_set', 409);
        }

        if (! Hash::check($request->string('pin'), $device->pin_hash)) {
            $this->throttle->hit($keys);
            $attempts = $device->pin_failed_attempts + 1;

            if ($attempts >= Device::PIN_MAX_ATTEMPTS) {
                $device->forceFill(['pin_hash' => null, 'pin_failed_attempts' => 0])->save();
                throw new ApiException('pin_disabled', 401);
            }

            $device->forceFill(['pin_failed_attempts' => $attempts])->save();
            throw new ApiException('invalid_pin', 401, ['attempts_left' => Device::PIN_MAX_ATTEMPTS - $attempts]);
        }

        $this->throttle->clear($keys);
        $device->forceFill(['pin_failed_attempts' => 0])->save();

        return $this->signedIn($device);
    }

    /**
     * New access token for a refresh token. `refresh_invalid` means show "Session expired".
     */
    public function refresh(RefreshRequest $request): JsonResponse
    {
        return response()->json($this->sessions->refresh($request->string('refresh_token')));
    }

    /**
     * Sign out this phone. It stays remembered (password-only next time) unless `forget_device` is true.
     */
    public function logout(LogoutRequest $request): Response
    {
        $device = $this->currentDevice($request);

        if ($device && $request->boolean('forget_device')) {
            $this->sessions->revokeDevice($device);
        } elseif ($device) {
            $this->sessions->endSession($device);
        } else {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->noContent();
    }

    /**
     * Sign out every phone and forget them all, including this one.
     */
    public function logoutAll(ConfirmPasswordRequest $request): Response
    {
        $this->confirmPassword($request);
        $this->sessions->revokeAll($request->user());

        return response()->noContent();
    }

    /**
     * "Not you?" on a signed-out phone. Always 204, so it can't be used to test device ids.
     */
    public function forgetDevice(ForgetDeviceRequest $request): Response
    {
        $device = $this->sessions->findDevice($request->string('device_id'), $request->string('device_secret'));
        if ($device) {
            $this->sessions->revokeDevice($device);
        }

        return response()->noContent();
    }

    private function rememberedDevice(string $id, string $secret): Device
    {
        $device = $this->sessions->findDevice($id, $secret);

        // Unknown, wrong secret or revoked all look the same: the app falls back to the email form.
        if (! $device) {
            throw new ApiException('device_revoked', 401);
        }

        return $device;
    }

    /**
     * Per device and per account, so guesses can't be spread across the email form and the device.
     *
     * @return list<string>
     */
    private function throttleKeys(Device $device): array
    {
        return [SignInThrottle::deviceKey($device->id), SignInThrottle::emailKey($device->user->email)];
    }

    private function signedIn(Device $device, ?string $secret = null): JsonResponse
    {
        $tokens = $this->sessions->signIn($device, $secret);
        $user = $device->user->load('onboardingProgress');

        return response()->json([...$tokens, 'user' => new UserResource($user)]);
    }
}
