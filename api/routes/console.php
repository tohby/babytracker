<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expired sign-up codes, old refresh tokens, revoked and stale devices (Prunable models).
Schedule::command('model:prune')->daily();
// Expired 30-minute access tokens.
Schedule::command('sanctum:prune-expired --hours=24')->daily();
