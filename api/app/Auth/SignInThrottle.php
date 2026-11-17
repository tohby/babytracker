<?php

namespace App\Auth;

use App\Http\Api\ApiException;
use Illuminate\Support\Facades\Cache;

/**
 * Pauses sign-in after repeated failures, getting longer each time: 5 failures within an hour pause
 * for 1 minute, 10 for 5 minutes, 15 or more for 15 minutes. Counted per account (hashed email)
 * and per device, so switching phone or IP doesn't reset the count, and unknown emails behave
 * exactly like real ones. Counters live only in the cache and expire after an hour.
 */
class SignInThrottle
{
    private const WINDOW_SECONDS = 3600;

    /** @var array<int, int> failures => pause seconds */
    private const TIERS = [15 => 900, 10 => 300, 5 => 60];

    /**
     * @param  list<string>  $keys
     */
    public function ensureAllowed(array $keys): void
    {
        $until = 0;
        foreach ($keys as $key) {
            $until = max($until, (int) Cache::get('signin:lock:'.$key, 0));
        }

        $retryAfter = $until - now()->getTimestamp();
        if ($retryAfter > 0) {
            throw new ApiException(
                'too_many_attempts',
                429,
                ['retry_after' => $retryAfter],
                ['Retry-After' => (string) $retryAfter],
            );
        }
    }

    /**
     * @param  list<string>  $keys
     */
    public function hit(array $keys): void
    {
        foreach ($keys as $key) {
            $failKey = 'signin:fail:'.$key;
            Cache::add($failKey, 0, self::WINDOW_SECONDS);
            $failures = (int) Cache::increment($failKey);

            if ($failures % 5 !== 0) {
                continue;
            }

            foreach (self::TIERS as $threshold => $seconds) {
                if ($failures >= $threshold) {
                    Cache::put('signin:lock:'.$key, now()->getTimestamp() + $seconds, $seconds);
                    break;
                }
            }
        }
    }

    /**
     * @param  list<string>  $keys
     */
    public function clear(array $keys): void
    {
        foreach ($keys as $key) {
            Cache::forget('signin:fail:'.$key);
            Cache::forget('signin:lock:'.$key);
        }
    }

    public static function emailKey(string $email): string
    {
        return 'email:'.hash('sha256', $email);
    }

    public static function deviceKey(string $deviceId): string
    {
        return 'device:'.$deviceId;
    }
}
