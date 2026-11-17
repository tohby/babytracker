<?php

namespace App\Http\Controllers;

use App\Auth\Passwords;
use App\Auth\SignInThrottle;
use App\Http\Api\ApiException;
use App\Models\Device;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * The remembered device behind the request's access token, if any.
     */
    protected function currentDevice(Request $request): ?Device
    {
        $deviceId = $request->user()?->currentAccessToken()->device_id ?? null;

        return $deviceId ? Device::query()->whereKey($deviceId)->whereNull('revoked_at')->first() : null;
    }

    /**
     * Re-check the password for a sensitive action; wrong guesses count toward the sign-in pause.
     */
    protected function confirmPassword(Request $request): void
    {
        $user = $request->user();
        $keys = [SignInThrottle::emailKey($user->email)];
        $throttle = app(SignInThrottle::class);
        $throttle->ensureAllowed($keys);

        if (! Passwords::check($user, (string) $request->input('password'))) {
            $throttle->hit($keys);
            throw new ApiException('invalid_credentials', 401);
        }
    }
}
