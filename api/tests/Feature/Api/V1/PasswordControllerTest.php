<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('forgot always answers 202 and emails only real accounts', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'kemi@example.com']);

    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'KEMI@example.com'])
        ->assertAccepted()
        ->assertExactJson(['status' => 'reset_link_sent']);
    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'nobody@example.com'])
        ->assertAccepted()
        ->assertExactJson(['status' => 'reset_link_sent']);

    Notification::assertSentTo($user, ResetPassword::class);
    Notification::assertCount(1);
});

test('reset sets the new password and signs out every phone', function () {
    $user = User::factory()->create();
    $phone = apiSignIn($user);
    $token = Password::createToken($user);

    $this->postJson(route('api.v1.auth.password.reset'), [
        'email' => $user->email, 'token' => $token, 'password' => 'a-brand-new-password',
    ])->assertNoContent();

    $this->getJson(route('api.v1.me'), bearer($phone['access_token']))->assertUnauthorized();
    $this->postJson(route('api.v1.auth.device-login'), [
        'device_id' => $phone['device']['id'], 'device_secret' => $phone['device']['secret'], 'password' => 'a-brand-new-password',
    ])->assertExactJson(['code' => 'device_revoked']);
    apiSignIn($user, 'a-brand-new-password');
});

test('reset rejects a bad token', function () {
    $user = User::factory()->create();

    $this->postJson(route('api.v1.auth.password.reset'), [
        'email' => $user->email, 'token' => 'made-up', 'password' => 'a-brand-new-password',
    ])
        ->assertUnprocessable()
        ->assertExactJson(['code' => 'invalid_token']);
});

test('the web reset page also signs out every phone', function () {
    $user = User::factory()->create();
    $phone = apiSignIn($user);

    $this->post(route('password.update'), [
        'token' => Password::createToken($user),
        'email' => $user->email,
        'password' => 'a-brand-new-password',
        'password_confirmation' => 'a-brand-new-password',
    ])->assertSessionHasNoErrors();

    $this->getJson(route('api.v1.me'), bearer($phone['access_token']))->assertUnauthorized();
});
