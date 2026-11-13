<?php

use Illuminate\Support\Facades\Route;

// Served at /api/* (no session/CSRF; used by the Expo app).
Route::get('ping', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]))->name('api.ping');
