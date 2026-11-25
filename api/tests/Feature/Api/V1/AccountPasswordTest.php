<?php

use App\Auth\DeviceSessions;
use App\Models\User;
use App\Notifications\PasswordChangeCode;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

function passwordlessSession(User $user): string
{
    $sessions = app(DeviceSessions::class);
    [$device, $secret] = $sessions->createDevice($user, 'ios');

    return $sessions->signIn($device, $secret)['access_token'];
}

test('changes the password with the current one and signs out other phones only', function () {
    $user = User::factory()->create();
    $here = apiSignIn($user)['access_token'];
    $other = apiSignIn($user)['access_token'];

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'password',
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'New-pass-2026!',
    ], bearer($here))->assertOk()->assertJsonPath('data.has_password', true);

    expect(Hash::check('New-pass-2026!', $user->fresh()->password))->toBeTrue();
    $this->getJson(route('api.v1.me'), bearer($here))->assertOk();
    $this->getJson(route('api.v1.me'), bearer($other))->assertUnauthorized();
    apiSignIn($user, 'New-pass-2026!');
});

test('rejects a wrong current password without changing anything', function () {
    $user = User::factory()->create();
    $token = apiSignIn($user)['access_token'];

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'wrong',
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'New-pass-2026!',
    ], bearer($token))->assertUnauthorized()->assertExactJson(['code' => 'invalid_credentials']);

    expect(Hash::check('password', $user->fresh()->password))->toBeTrue();
});

test('needs a matching confirmation', function () {
    $token = apiSignIn(User::factory()->create())['access_token'];

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'password',
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'Other-pass-2026!',
    ], bearer($token))->assertUnprocessable()->assertJsonPath('code', 'validation_failed');
});

test('a passwordless account sets its first password with an email code from this phone', function () {
    Notification::fake();
    $user = User::factory()->create(['password' => null]);
    $token = passwordlessSession($user);
    $second = passwordlessSession($user);

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'anything',
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'New-pass-2026!',
    ], bearer($token))->assertUnprocessable()->assertExactJson(['code' => 'code_required']);

    $this->postJson(route('api.v1.me.password-code'), [], bearer($token))->assertAccepted();
    $code = Notification::sent(new AnonymousNotifiable, PasswordChangeCode::class)->sole()->code;
    $body = ['code' => $code, 'password' => 'New-pass-2026!', 'password_confirmation' => 'New-pass-2026!'];

    // Scoped to the phone that asked for it.
    $this->putJson(route('api.v1.me.password.update'), $body, bearer($second))
        ->assertUnprocessable()->assertExactJson(['code' => 'invalid_code']);
    $this->putJson(route('api.v1.me.password.update'), $body, bearer($token))
        ->assertOk()->assertJsonPath('data.has_password', true);

    expect(Hash::check('New-pass-2026!', $user->fresh()->password))->toBeTrue();
    // Single use.
    $this->putJson(route('api.v1.me.password.update'), $body, bearer($token))
        ->assertUnprocessable()->assertExactJson(['code' => 'invalid_code']);
});

test('a forgotten current password can be replaced with an email code', function () {
    Notification::fake();
    $user = User::factory()->create();
    $token = apiSignIn($user)['access_token'];

    $this->postJson(route('api.v1.me.password-code'), [], bearer($token))->assertAccepted();
    $code = Notification::sent(new AnonymousNotifiable, PasswordChangeCode::class)->sole()->code;
    $this->putJson(route('api.v1.me.password.update'), [
        'code' => $code === '000000' ? '111111' : '000000',
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'New-pass-2026!',
    ], bearer($token))->assertUnprocessable()->assertExactJson(['code' => 'invalid_code']);

    $this->putJson(route('api.v1.me.password.update'), [
        'code' => $code,
        'password' => 'New-pass-2026!',
        'password_confirmation' => 'New-pass-2026!',
    ], bearer($token))->assertOk();
    apiSignIn($user, 'New-pass-2026!');
});

test('password codes are rate limited per account', function () {
    Notification::fake();
    $token = apiSignIn(User::factory()->create())['access_token'];

    $this->postJson(route('api.v1.me.password-code'), [], bearer($token))->assertAccepted();
    $this->postJson(route('api.v1.me.password-code'), [], bearer($token))->assertTooManyRequests();
});

test('needs to be signed in', function () {
    $this->putJson(route('api.v1.me.password.update'), [])->assertUnauthorized();
    $this->postJson(route('api.v1.me.password-code'))->assertUnauthorized();
});
