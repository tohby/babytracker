<?php

namespace App\Http\Controllers\Api\V1;

use App\Auth\DeviceSessions;
use App\Auth\EmailCodes;
use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SendEmailAuthCodeRequest;
use App\Http\Requests\Api\V1\VerifyEmailAuthCodeRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\EmailAuthCode;
use App\Models\User;
use App\Notifications\RegistrationCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class EmailAuthCodeController extends Controller
{
    public function __construct(private readonly DeviceSessions $sessions) {}

    public function send(SendEmailAuthCodeRequest $request): JsonResponse
    {
        $email = User::normalizeEmail($request->string('email'));
        $intent = $request->input('intent');
        $signingIn = $intent === EmailAuthCode::SIGN_IN;
        $emailCode = DB::transaction(function () use ($request, $email, $intent, $signingIn): ?array {
            $user = User::query()->where('email', $email)->lockForUpdate()->first();

            if ($signingIn && ! $user) {
                return null;
            }

            if (! $signingIn && $user) {
                throw new ApiException('email_in_use', Response::HTTP_CONFLICT);
            }

            $locale = $user->locale ?? $request->input('locale') ?? 'en';

            return [EmailCodes::issue($email, $intent, $user?->id, $locale, consented: ! $signingIn), $locale];
        }, attempts: 3);

        if ($emailCode !== null) {
            [$code, $locale] = $emailCode;
            Notification::route('mail', $email)->notify((new RegistrationCode($code, $signingIn, EmailAuthCode::CODE_TTL_MINUTES))->locale($locale));
        }

        return response()->json(['status' => 'verification_sent'], Response::HTTP_ACCEPTED);
    }

    public function verify(VerifyEmailAuthCodeRequest $request): JsonResponse
    {
        $email = User::normalizeEmail($request->string('email'));
        $intent = $request->input('intent');
        $signingIn = $intent === EmailAuthCode::SIGN_IN;
        $result = DB::transaction(function () use ($request, $email, $intent, $signingIn): JsonResponse|ApiException {
            $challenge = EmailCodes::claim($email, $intent, $request->string('code'));
            if ($challenge instanceof ApiException) {
                return $challenge;
            }

            $user = User::query()->where('email', $email)->lockForUpdate()->first();
            if (! $signingIn && $user) {
                return new ApiException('email_in_use', Response::HTTP_CONFLICT);
            }
            if ($signingIn && (! $user || $user->id !== $challenge->user_id)) {
                return new ApiException('invalid_code', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            if (! $user) {
                $user = new User;
                $user->email = $email;
                $user->locale = $challenge->locale;
                $user->health_consent_at = $challenge->consented_at;
                $user->privacy_policy_version = config('nappa.privacy_policy_version');
            }
            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $device = $this->sessions->findDevice($request->input('device_id'), $request->input('device_secret'));
            $secret = null;
            if (! $device || $device->user_id !== $user->id) {
                [$device, $secret] = $this->sessions->createDevice($user, $request->input('platform'));
            }

            return response()->json([
                ...$this->sessions->signIn($device, $secret),
                'user' => new UserResource($user->load('onboardingProgress')),
            ], $signingIn ? Response::HTTP_OK : Response::HTTP_CREATED);
        }, attempts: 3);

        if ($result instanceof ApiException) {
            throw $result;
        }

        return $result;
    }
}
