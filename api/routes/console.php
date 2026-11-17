<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Scheduler. Production has a single cron entry that runs `artisan schedule:run`
| every minute (see deploy/README.md); every job lives here. Times are UTC.
| Output goes to storage/logs/schedule.log.
*/

$log = storage_path('logs/schedule.log');

// Queued jobs. Shared hosting can't keep a worker running, so start one each
// minute that exits when the queue is empty or after 50s.
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3')
    ->everyMinute()
    ->withoutOverlapping(5)
    ->appendOutputTo($log);

// Housekeeping, spread out in the quiet hours.
// Expired sign-up codes, old refresh tokens, revoked and stale devices (Prunable models).
Schedule::command('model:prune')->dailyAt('03:00')->withoutOverlapping()->appendOutputTo($log);
// Expired 30-minute access tokens.
Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('03:05')->withoutOverlapping()->appendOutputTo($log);
// Expired password-reset tokens.
Schedule::command('auth:clear-resets')->dailyAt('03:10')->withoutOverlapping()->appendOutputTo($log);
// Failed jobs older than a week.
Schedule::command('queue:prune-failed --hours=168')->dailyAt('03:15')->withoutOverlapping()->appendOutputTo($log);
