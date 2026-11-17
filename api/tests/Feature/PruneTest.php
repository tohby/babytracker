<?php

use App\Models\Device;
use App\Models\PendingRegistration;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Str;

/**
 * The nightly cleanup (routes/console.php): expired sign-up codes, old refresh tokens, forgotten
 * and unused devices, and expired access tokens. Nothing is kept longer than it's needed.
 */
function device(User $user, array $attributes = []): Device
{
    $device = new Device;
    $device->forceFill(['user_id' => $user->id, 'secret_hash' => hash('sha256', Str::random()), 'last_used_at' => now(), ...$attributes])->save();

    return $device;
}

function refreshToken(Device $device, array $attributes = []): RefreshToken
{
    $token = new RefreshToken;
    $token->forceFill(['device_id' => $device->id, 'family_id' => (string) Str::ulid(), 'token_hash' => hash('sha256', Str::random()), 'expires_at' => now()->addDays(60), ...$attributes])->save();

    return $token;
}

function pending(string $email, array $attributes = []): PendingRegistration
{
    return PendingRegistration::create(['email' => $email, 'password_hash' => 'x', 'consented_at' => now(), 'code_hash' => str_repeat('0', 64), 'expires_at' => now()->addMinutes(15), ...$attributes]);
}

test('removes expired sign-ups and keeps live ones', function () {
    $expired = pending('old@example.com', ['expires_at' => now()->subMinute()]);
    $live = pending('new@example.com');

    $this->artisan('model:prune', ['--model' => [PendingRegistration::class]])->assertSuccessful();

    expect(PendingRegistration::pluck('id')->all())->toBe([$live->id]);
});

test('keeps refresh tokens a week past expiry, so replays are still caught, then removes them', function () {
    $device = device(User::factory()->create());
    $live = refreshToken($device);
    $recentlyExpired = refreshToken($device, ['expires_at' => now()->subDays(3)]);
    $old = refreshToken($device, ['expires_at' => now()->subDays(8)]);

    $this->artisan('model:prune', ['--model' => [RefreshToken::class]])->assertSuccessful();

    expect(RefreshToken::pluck('id')->sort()->values()->all())->toBe(collect([$live->id, $recentlyExpired->id])->sort()->values()->all());
});

test('removes forgotten devices and devices unused for 180 days, with their tokens', function () {
    $user = User::factory()->create();
    $active = device($user);
    $revoked = device($user, ['revoked_at' => now()]);
    $stale = device($user, ['last_used_at' => now()->subDays(181)]);
    $quiet = device($user, ['last_used_at' => now()->subDays(179)]);
    refreshToken($stale);
    $user->createToken('ios')->accessToken->forceFill(['device_id' => $revoked->id])->save();

    $this->artisan('model:prune', ['--model' => [Device::class]])->assertSuccessful();

    expect(Device::pluck('id')->sort()->values()->all())->toBe(collect([$active->id, $quiet->id])->sort()->values()->all())
        ->and(RefreshToken::count())->toBe(0)
        ->and($user->tokens()->count())->toBe(0);
});

test('a pruned device has to sign in with the email again', function () {
    $user = User::factory()->create();
    $tokens = apiSignIn($user);
    $this->travel(181)->days();

    $this->artisan('model:prune', ['--model' => [Device::class]])->assertSuccessful();

    $this->postJson(route('api.v1.auth.device-login'), [
        'device_id' => $tokens['device']['id'], 'device_secret' => $tokens['device']['secret'], 'password' => 'password',
    ])->assertExactJson(['code' => 'device_revoked']);
});

test('removes access tokens a day after they expire', function () {
    $user = User::factory()->create();
    $user->createToken('old', ['*'], now()->subHours(25));
    $user->createToken('recent', ['*'], now()->subHours(2));
    $user->createToken('live', ['*'], now()->addMinutes(30));

    $this->artisan('sanctum:prune-expired', ['--hours' => 24])->assertSuccessful();

    expect($user->tokens()->pluck('name')->sort()->values()->all())->toBe(['live', 'recent']);
});

test('the queue runs every minute and the cleanups run nightly', function () {
    $events = collect(app(Schedule::class)->events())
        ->mapWithKeys(fn (Event $e) => [Str::after($e->command, "'artisan' ") => $e->expression]);

    expect($events->all())->toBe([
        'queue:work --stop-when-empty --max-time=50 --tries=3' => '* * * * *',
        'model:prune' => '0 3 * * *',
        'sanctum:prune-expired --hours=24' => '5 3 * * *',
        'auth:clear-resets' => '10 3 * * *',
        'queue:prune-failed --hours=168' => '15 3 * * *',
    ]);
});
