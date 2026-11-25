<?php

use App\Http\Controllers\Api\V1\AccountPasswordController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AvatarController;
use App\Http\Controllers\Api\V1\BabyController;
use App\Http\Controllers\Api\V1\BabyEventController;
use App\Http\Controllers\Api\V1\EmailAuthCodeController;
use App\Http\Controllers\Api\V1\OnboardingController;
use App\Http\Controllers\Api\V1\PasswordController;
use App\Http\Controllers\Api\V1\PinController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\RegistrationController;
use Illuminate\Support\Facades\Route;

// Served at /api/* (no session/CSRF; used by the Expo app).
Route::get('ping', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]))->name('api.ping');

// Versioned so old app builds in the wild keep working when the API changes.
Route::prefix('v1')->name('api.v1.')->group(function () {
    // Signed out. Rate limits are in AppServiceProvider; sign-in pauses after failures are in SignInThrottle.
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('register', [RegistrationController::class, 'register'])->middleware('throttle:auth-register')->name('register');
        Route::post('register/resend', [RegistrationController::class, 'resend'])->middleware('throttle:auth-email')->name('register.resend');
        Route::post('password/forgot', [PasswordController::class, 'forgot'])->middleware('throttle:auth-email')->name('password.forgot');
        Route::post('email-code', [EmailAuthCodeController::class, 'send'])->middleware('throttle:auth-email-code')->name('email-code');

        Route::middleware('throttle:api-auth')->group(function () {
            Route::post('register/verify', [RegistrationController::class, 'verify'])->name('register.verify');
            Route::post('email-code/verify', [EmailAuthCodeController::class, 'verify'])->name('email-code.verify');
            Route::post('login', [AuthController::class, 'login'])->name('login');
            Route::post('device-login', [AuthController::class, 'deviceLogin'])->name('device-login');
            Route::post('pin-login', [AuthController::class, 'pinLogin'])->name('pin-login');
            Route::post('forget-device', [AuthController::class, 'forgetDevice'])->name('forget-device');
            Route::post('password/reset', [PasswordController::class, 'reset'])->name('password.reset');
        });

        Route::post('refresh', [AuthController::class, 'refresh'])->middleware('throttle:auth-refresh')->name('refresh');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::post('auth/logout-all', [AuthController::class, 'logoutAll'])->middleware('throttle:auth-sensitive')->name('auth.logout-all');

        Route::get('me', [ProfileController::class, 'show'])->name('me');
        Route::patch('me', [ProfileController::class, 'update'])->name('me.update');
        Route::post('me/delete-code', [ProfileController::class, 'sendDeleteCode'])->middleware('throttle:auth-delete-code')->name('me.delete-code');
        Route::delete('me', [ProfileController::class, 'destroy'])->middleware('throttle:auth-sensitive')->name('me.destroy');

        Route::post('me/avatar', [AvatarController::class, 'store'])->middleware('throttle:auth-sensitive')->name('me.avatar.store');
        Route::delete('me/avatar', [AvatarController::class, 'destroy'])->name('me.avatar.destroy');

        Route::post('me/password-code', [AccountPasswordController::class, 'sendCode'])->middleware('throttle:auth-password-code')->name('me.password-code');
        Route::put('me/password', [AccountPasswordController::class, 'update'])->middleware('throttle:auth-sensitive')->name('me.password.update');

        Route::put('me/pin', [PinController::class, 'store'])->middleware('throttle:auth-sensitive')->name('me.pin.store');
        Route::delete('me/pin', [PinController::class, 'destroy'])->name('me.pin.destroy');

        Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
        Route::put('onboarding', [OnboardingController::class, 'update'])->name('onboarding.update');
        Route::post('onboarding/complete', [OnboardingController::class, 'complete'])->name('onboarding.complete');

        Route::apiResource('babies', BabyController::class);
        Route::get('babies/{baby}/events', [BabyEventController::class, 'index'])->name('babies.events.index');
        Route::put('babies/{baby}/events/{id}', [BabyEventController::class, 'upsert'])->whereUuid('id')->name('babies.events.upsert');
    });
});
