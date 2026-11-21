<?php

namespace App\Auth;

use App\Http\Api\ApiException;
use App\Models\EmailAuthCode;
use Illuminate\Http\Response;

class EmailCodes
{
    public static function issue(string $email, string $intent, ?int $userId, ?string $locale, bool $consented = false, string $scope = ''): string
    {
        $code = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
        EmailAuthCode::upsert([[
            'email' => $email,
            'intent' => $intent,
            'scope' => $scope,
            'user_id' => $userId,
            'locale' => $locale,
            'consented_at' => $consented ? now() : null,
            'code_hash' => self::hash($email, $intent, $scope, $code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(EmailAuthCode::CODE_TTL_MINUTES),
        ]], uniqueBy: ['email', 'intent', 'scope'], update: ['user_id', 'locale', 'consented_at', 'code_hash', 'attempts', 'expires_at']);

        return $code;
    }

    /** Claim inside the transaction performing the action. Report failures after commit so guesses count. */
    public static function claim(string $email, string $intent, string $code, string $scope = ''): EmailAuthCode|ApiException
    {
        $challenge = EmailAuthCode::query()
            ->where(['email' => $email, 'intent' => $intent, 'scope' => $scope])
            ->lockForUpdate()->first();
        $invalid = new ApiException('invalid_code', Response::HTTP_UNPROCESSABLE_ENTITY);

        if (! $challenge) {
            return $invalid;
        }

        $matches = hash_equals($challenge->code_hash, self::hash($email, $intent, $scope, $code));
        if ($challenge->expires_at->lte(now())) {
            return $matches ? new ApiException('code_expired', Response::HTTP_UNPROCESSABLE_ENTITY) : $invalid;
        }

        if (! $matches) {
            $challenge->increment('attempts');
            if ($challenge->attempts >= EmailAuthCode::MAX_ATTEMPTS) {
                $challenge->delete();
            }

            return $invalid;
        }

        $challenge->delete();

        return $challenge;
    }

    /** Scope the keyed digest so a code cannot be moved between challenges. */
    private static function hash(string $email, string $intent, string $scope, string $code): string
    {
        $scopePrefix = $scope === '' ? '' : "{$scope}\n";

        return hash_hmac('sha256', "email-auth\n{$email}\n{$intent}\n{$scopePrefix}{$code}", (string) config('app.key'));
    }
}
