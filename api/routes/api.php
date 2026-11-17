<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BabyController;
use Illuminate\Support\Facades\Route;

// Served at /api/* (no session/CSRF; used by the Expo app).
Route::get('ping', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]))->name('api.ping');

// Versioned so old app builds in the wild keep working when the API changes.
Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::middleware('throttle:api-auth')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('me', [AuthController::class, 'me'])->name('me');

        Route::apiResource('babies', BabyController::class);
    });
});
