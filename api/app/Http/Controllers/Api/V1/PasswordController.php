<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\EmailRequest;
use App\Http\Requests\Api\V1\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Forgot password. The email links to the web reset page for now (Fortify, `password.reset`);
 * the reset endpoint is here for an in-app reset screen later. Either way, a reset signs out every
 * phone (RevokeDevicesAfterPasswordReset).
 */
class PasswordController extends Controller
{
    /**
     * Always 202, whether or not the email has an account.
     */
    public function forgot(EmailRequest $request): JsonResponse
    {
        Password::sendResetLink(['email' => User::normalizeEmail($request->string('email'))]);

        return response()->json(['status' => 'reset_link_sent'], Response::HTTP_ACCEPTED);
    }

    public function reset(ResetPasswordRequest $request): Response
    {
        $status = Password::reset(
            [
                'email' => User::normalizeEmail($request->string('email')),
                'token' => $request->string('token'),
                'password' => $request->string('password'),
            ],
            function (User $user, string $password) {
                $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new ApiException('invalid_token', 422);
        }

        return response()->noContent();
    }
}
