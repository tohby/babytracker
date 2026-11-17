<?php

namespace App\Http\Controllers\Api\V1;

use App\Auth\DeviceSessions;
use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\EmailRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Requests\Api\V1\VerifyRegistrationRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\AccountAlreadyExists;
use App\Notifications\RegistrationCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

/**
 * Sign-up by email code: register → 6-digit code by email → verify creates the account.
 * register and resend always answer 202, whether or not the email already has an account.
 */
class RegistrationController extends Controller
{
    public function __construct(private readonly DeviceSessions $sessions) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $email = User::normalizeEmail($request->string('email'));
        $locale = $request->input('locale');

        if (User::where('email', $email)->exists()) {
            Notification::route('mail', $email)->notify((new AccountAlreadyExists)->locale($locale ?? 'en'));

            return $this->codeSent();
        }

        $code = self::newCode();
        PendingRegistration::updateOrCreate(['email' => $email], [
            'password_hash' => Hash::make($request->string('password')),
            'locale' => $locale,
            'consented_at' => now(),
            'code_hash' => self::hashCode($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(PendingRegistration::CODE_TTL_MINUTES),
        ]);

        Notification::route('mail', $email)->notify((new RegistrationCode($code))->locale($locale ?? 'en'));

        return $this->codeSent();
    }

    public function resend(EmailRequest $request): JsonResponse
    {
        $pending = PendingRegistration::firstWhere('email', User::normalizeEmail($request->string('email')));

        if ($pending) {
            $code = self::newCode();
            $pending->forceFill([
                'code_hash' => self::hashCode($code),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(PendingRegistration::CODE_TTL_MINUTES),
            ])->save();

            Notification::route('mail', $pending->email)->notify((new RegistrationCode($code))->locale($pending->locale ?? 'en'));
        }

        return $this->codeSent();
    }

    /**
     * Right code: create the account (email already verified), remember this phone, sign in.
     * Wrong, expired or unknown all return `invalid_code`; after 5 wrong tries the sign-up must restart.
     */
    public function verify(VerifyRegistrationRequest $request): JsonResponse
    {
        $email = User::normalizeEmail($request->string('email'));
        $pending = PendingRegistration::firstWhere('email', $email);

        if (! $pending || $pending->isExpired()) {
            throw new ApiException('invalid_code', 422);
        }

        if (! hash_equals($pending->code_hash, self::hashCode($request->string('code')))) {
            $pending->increment('attempts');
            if ($pending->attempts >= PendingRegistration::MAX_ATTEMPTS) {
                $pending->delete();
            }

            throw new ApiException('invalid_code', 422);
        }

        [$user, $device, $secret] = DB::transaction(function () use ($pending, $request) {
            // Someone finished another sign-up for this email in the meantime.
            if (User::where('email', $pending->email)->exists()) {
                $pending->delete();
                throw new ApiException('invalid_code', 422);
            }

            $user = new User;
            $user->email = $pending->email;
            $user->password = $pending->password_hash; // Already a hash; the cast keeps it as is.
            $user->locale = $pending->locale;
            $user->health_consent_at = $pending->consented_at;
            $user->privacy_policy_version = config('nappa.privacy_policy_version');
            $user->email_verified_at = now();
            $user->save();

            $pending->delete();
            [$device, $secret] = $this->sessions->createDevice($user, $request->input('platform'));

            return [$user, $device, $secret];
        });

        $tokens = $this->sessions->signIn($device, $secret);

        return response()->json([...$tokens, 'user' => new UserResource($user->load('onboardingProgress'))], Response::HTTP_CREATED);
    }

    private function codeSent(): JsonResponse
    {
        return response()->json(['status' => 'verification_sent'], Response::HTTP_ACCEPTED);
    }

    private static function newCode(): string
    {
        return str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
    }

    /** Keyed with APP_KEY: a 6-digit code is too short for a plain hash to hide it. */
    private static function hashCode(string $code): string
    {
        return hash_hmac('sha256', $code, (string) config('app.key'));
    }
}
