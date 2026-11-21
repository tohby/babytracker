<?php

use App\Auth\DeviceSessions;
use App\Models\Device;
use App\Models\User;
use App\Notifications\RegistrationCode;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

beforeEach(fn () => Notification::fake());

function emailAuthCode(): string
{
    $notifications = Notification::sent(new AnonymousNotifiable, RegistrationCode::class);

    return $notifications->last()->code;
}

test('a valid sign-in code rotates the remembered device session and can only be used once', function () {
    $user = User::factory()->create();
    $sessions = app(DeviceSessions::class);
    [$device, $secret] = $sessions->createDevice($user, 'ios');
    $oldTokens = $sessions->signIn($device, $secret);
    $credentials = ['email' => $user->email, 'intent' => 'sign_in'];

    $this->postJson('/api/v1/auth/email-code', $credentials)
        ->assertAccepted()
        ->assertExactJson(['status' => 'verification_sent']);

    $code = emailAuthCode();
    expect(DB::table('email_auth_codes')->sole()->code_hash)->not->toBe($code);

    $verify = [...$credentials, 'code' => $code, 'device_id' => $device->id, 'device_secret' => $secret];
    $response = $this->postJson('/api/v1/auth/email-code/verify', $verify)
        ->assertOk()
        ->assertJsonPath('user.email', $user->email)
        ->assertJsonPath('device.id', $device->id)
        ->assertJsonMissingPath('device.secret')
        ->assertJsonStructure(['access_token', 'refresh_token']);

    $this->postJson('/api/v1/auth/email-code/verify', $verify)
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'invalid_code']);
    $this->getJson(route('api.v1.me'), bearer($oldTokens['access_token']))->assertUnauthorized();
    $this->getJson(route('api.v1.me'), bearer($response->json('access_token')))->assertOk();
    expect(Device::count())->toBe(1);
});

test('a sign-in request for an unknown email answers identically without sending mail', function () {
    $this->postJson('/api/v1/auth/email-code', ['email' => 'unknown@example.com', 'intent' => 'sign_in'])
        ->assertAccepted()
        ->assertExactJson(['status' => 'verification_sent']);

    Notification::assertNothingSent();
});

test('verification distinguishes an expired code and a wrong code', function () {
    $user = User::factory()->create();
    $credentials = ['email' => $user->email, 'intent' => 'sign_in'];
    $this->freezeTime();
    $this->postJson('/api/v1/auth/email-code', $credentials)->assertAccepted();
    $code = emailAuthCode();

    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => $code === '000000' ? '111111' : '000000'])
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'invalid_code']);

    $this->travel(10)->minutes();

    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => $code])
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'code_expired']);
});

test('an invalid email reaches validation without triggering the email limiter error path', function () {
    $this->postJson('/api/v1/auth/email-code', ['email' => ['invalid'], 'intent' => 'sign_in'])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'validation_failed');
    Notification::assertNothingSent();
});

test('five wrong attempts invalidate the challenge and a resend requires waiting', function () {
    $user = User::factory()->create();
    $credentials = ['email' => $user->email, 'intent' => 'sign_in'];
    $this->postJson('/api/v1/auth/email-code', $credentials)->assertAccepted();
    $code = emailAuthCode();

    $this->postJson('/api/v1/auth/email-code', $credentials)
        ->assertTooManyRequests()
        ->assertJsonPath('code', 'too_many_requests');

    $wrong = $code === '000000' ? '111111' : '000000';
    foreach (range(1, 5) as $_) {
        $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => $wrong])
            ->assertUnprocessable()
            ->assertExactJson(['code' => 'invalid_code']);
    }

    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => $code])
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'invalid_code']);

    $this->travel(61)->seconds();
    $this->postJson('/api/v1/auth/email-code', $credentials)->assertAccepted();
    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => emailAuthCode()])->assertOk();
});

test('create account verifies ownership before creating a passwordless account', function () {
    $credentials = ['email' => 'Kemi@example.com', 'intent' => 'create_account'];

    $this->postJson('/api/v1/auth/email-code', [...$credentials, 'consent' => true, 'locale' => 'en'])
        ->assertAccepted();
    expect(User::count())->toBe(0);

    $code = emailAuthCode();
    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'intent' => 'sign_in', 'code' => $code])
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'invalid_code']);
    $this->postJson('/api/v1/auth/email-code/verify', [...$credentials, 'code' => $code, 'platform' => 'ios'])
        ->assertCreated()
        ->assertJsonPath('user.email', 'kemi@example.com')
        ->assertJsonPath('user.email_verified', true)
        ->assertJsonStructure(['access_token', 'refresh_token', 'device' => ['id', 'secret']]);

    expect(User::sole()->password)->toBeNull()
        ->and(User::sole()->locale)->toBe('en')
        ->and(User::sole()->health_consent_at)->not->toBeNull();
});

test('create account sends the email-in-use code and requires consent', function () {
    $user = User::factory()->create();
    $credentials = ['email' => $user->email, 'intent' => 'create_account'];
    $this->postJson('/api/v1/auth/email-code', $credentials)
        ->assertUnprocessable()
        ->assertJsonPath('errors.consent', ['accepted_if']);
    $this->postJson('/api/v1/auth/email-code', [...$credentials, 'consent' => true])
        ->assertTooManyRequests();

    $this->travel(61)->seconds();
    $this->postJson('/api/v1/auth/email-code', [...$credentials, 'consent' => true])
        ->assertConflict()
        ->assertExactJson(['code' => 'email_in_use']);
    Notification::assertNothingSent();

    $this->postJson('/api/v1/auth/email-code', [...$credentials, 'intent' => 'sign_in'])
        ->assertAccepted();
});
