<?php

namespace App\Auth;

use App\Http\Api\ApiException;
use App\Models\Device;
use App\Models\RefreshToken;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Remembered devices and their tokens.
 *
 * - Access token (Sanctum, 30 min): sent on every request. Like a festival wristband.
 * - Refresh token (single use, 60 days idle, 1 year max): traded for a new access token and a new
 *   refresh token. Like the ticket stub you swap for a fresh wristband; each stub works once.
 * - Device secret: a random key the phone keeps in its Keychain/Keystore. With the password (or PIN)
 *   it signs back in without the email. Only its SHA-256 is stored.
 */
class DeviceSessions
{
    /**
     * @return array{0: Device, 1: string} The device and its plain secret (returned to the phone once).
     */
    public function createDevice(User $user, ?string $platform): array
    {
        $secret = self::randomToken();

        $device = new Device;
        $device->user_id = $user->id;
        $device->secret_hash = self::hash($secret);
        $device->platform = $platform;
        $device->last_used_at = now();
        $device->save();

        return [$device, $secret];
    }

    /**
     * The active device for this id and secret, or null. Never says which part was wrong.
     */
    public function findDevice(?string $id, ?string $secret): ?Device
    {
        if (! is_string($id) || ! is_string($secret) || $id === '' || $secret === '') {
            return null;
        }

        $device = Device::query()->whereKey($id)->whereNull('revoked_at')->first();

        if (! $device || ! hash_equals($device->secret_hash, self::hash($secret))) {
            return null;
        }

        return $device;
    }

    /**
     * Start a new sign-in on this device: a fresh access token and a new refresh token family.
     *
     * @return array<string, mixed>
     */
    public function signIn(Device $device, ?string $plainSecret = null): array
    {
        return DB::transaction(function () use ($device, $plainSecret) {
            // One live sign-in per device: older refresh chains on this phone end here.
            $this->endSession($device);

            return $this->issue($device, (string) Str::ulid(), now(), $plainSecret);
        });
    }

    /**
     * Trade a refresh token for new tokens (rotation). A token used twice means it was copied:
     * the whole family is revoked and the phone has to sign in again.
     *
     * @return array<string, mixed>
     */
    public function refresh(string $plain): array
    {
        $replayedOn = null;

        $result = DB::transaction(function () use ($plain, &$replayedOn) {
            $token = RefreshToken::query()->where('token_hash', self::hash($plain))->lockForUpdate()->first();
            $device = $token?->device;

            if (! $token || ! $device || $device->isRevoked() || $token->revoked_at || $token->expires_at->isPast()) {
                return null;
            }

            if ($token->used_at) {
                // Within a few seconds it's the app retrying after a dropped response; anything later is a replay.
                if ($token->used_at->diffInSeconds(now()) > (int) config('nappa.tokens.refresh_reuse_grace_seconds')) {
                    $replayedOn = $device;
                }

                return null;
            }

            $token->forceFill(['used_at' => now()])->save();

            $familyStartedAt = CarbonImmutable::parse(
                RefreshToken::query()->where('family_id', $token->family_id)->min('created_at'),
            );

            return $this->issue($device, $token->family_id, $familyStartedAt);
        });

        // Outside the transaction: throwing inside it would roll the sign-out back.
        if ($replayedOn) {
            $this->endSession($replayedOn);
        }

        return $result ?? throw new ApiException('refresh_invalid', 401);
    }

    /**
     * Sign this device out: its access and refresh tokens stop working. The device stays remembered.
     */
    public function endSession(Device $device): void
    {
        $device->refreshTokens()->whereNull('revoked_at')->update(['revoked_at' => now()]);
        $device->accessTokens()->delete();
    }

    /**
     * Forget this device: signed out, and the next sign-in on that phone needs the email again.
     */
    public function revokeDevice(Device $device): void
    {
        DB::transaction(function () use ($device) {
            $this->endSession($device);
            $device->forceFill(['revoked_at' => now(), 'pin_hash' => null])->save();
        });
    }

    /**
     * Sign out every phone and forget every device (password reset, "sign out everywhere", lost phone).
     */
    public function revokeAll(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->devices()->whereNull('revoked_at')->get()->each(fn (Device $d) => $this->revokeDevice($d));
            $user->tokens()->delete(); // Also tokens issued before devices existed.
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function issue(Device $device, string $familyId, CarbonImmutable $familyStartedAt, ?string $plainSecret = null): array
    {
        $accessMinutes = (int) config('nappa.tokens.access_minutes');
        $access = $device->user->createToken($device->platform ?? 'app', ['*'], now()->addMinutes($accessMinutes));
        $access->accessToken->forceFill(['device_id' => $device->id])->save();

        $refreshPlain = self::randomToken();
        $expiresAt = min(
            now()->addDays((int) config('nappa.tokens.refresh_idle_days')),
            $familyStartedAt->addDays((int) config('nappa.tokens.refresh_max_days')),
        );

        $refresh = new RefreshToken;
        $refresh->device_id = $device->id;
        $refresh->family_id = $familyId;
        $refresh->token_hash = self::hash($refreshPlain);
        $refresh->expires_at = $expiresAt;
        $refresh->save();

        $device->forceFill(['last_used_at' => now()])->save();

        return [
            'access_token' => $access->plainTextToken,
            'token_type' => 'Bearer',
            'expires_in' => $accessMinutes * 60,
            'refresh_token' => $refreshPlain,
            'refresh_expires_at' => $expiresAt->toIso8601String(),
            'device' => array_filter([
                'id' => $device->id,
                // Only on the sign-in that created the device; the phone must store it then.
                'secret' => $plainSecret,
                'pin_enabled' => $device->hasPin(),
            ], fn ($v) => $v !== null),
        ];
    }

    /** 32 random bytes, URL-safe. Long and random, so a fast hash is enough to store it. */
    public static function randomToken(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    public static function hash(string $value): string
    {
        return hash('sha256', $value);
    }
}
