<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/**
 * Request caps from AppServiceProvider. Separate from the sign-in pause (SignInThrottle): these
 * stop floods of emails and requests, and answer 429 `too_many_requests` with Retry-After.
 */
beforeEach(fn () => Notification::fake());

test('sign-up allows 5 attempts an hour per email', function () {
    $body = ['email' => 'kemi@example.com', 'password' => 'a-long-password', 'consent' => true];
    foreach (range(1, 5) as $_) {
        $this->postJson(route('api.v1.auth.register'), $body)->assertAccepted();
    }

    $this->postJson(route('api.v1.auth.register'), $body)
        ->assertTooManyRequests()
        ->assertJsonPath('code', 'too_many_requests')
        ->assertHeader('Retry-After');

    // Other emails are unaffected, and the cap lifts after the hour.
    $this->postJson(route('api.v1.auth.register'), [...$body, 'email' => 'ada@example.com'])->assertAccepted();
    $this->travel(61)->minutes();
    $this->postJson(route('api.v1.auth.register'), $body)->assertAccepted();
});

test('sign-up allows 20 attempts an hour per IP, across emails', function () {
    foreach (range(1, 20) as $i) {
        $this->postJson(route('api.v1.auth.register'), ['email' => "p{$i}@example.com", 'password' => 'a-long-password', 'consent' => true])
            ->assertAccepted();
    }

    $this->postJson(route('api.v1.auth.register'), ['email' => 'p21@example.com', 'password' => 'a-long-password', 'consent' => true])
        ->assertTooManyRequests();
});

test('the email cap counts case and spaces as the same address', function () {
    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertAccepted();

    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => ' KEMI@example.com '])->assertTooManyRequests();
});

test('forgot password sends at most one email a minute and 5 an hour per email', function () {
    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertAccepted();
    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertTooManyRequests();

    foreach (range(2, 5) as $_) {
        $this->travel(61)->seconds();
        $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertAccepted();
    }

    $this->travel(61)->seconds();
    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertTooManyRequests();
});

test('resend and forgot password have separate caps', function () {
    $this->postJson(route('api.v1.auth.register.resend'), ['email' => 'kemi@example.com'])->assertAccepted();

    $this->postJson(route('api.v1.auth.password.forgot'), ['email' => 'kemi@example.com'])->assertAccepted();
});

test('sign-in requests are capped at 30 a minute per IP, whatever the email', function () {
    foreach (range(1, 30) as $i) {
        $this->postJson(route('api.v1.auth.login'), ['email' => "p{$i}@example.com", 'password' => 'x'])->assertUnauthorized();
    }

    $this->postJson(route('api.v1.auth.login'), ['email' => 'p31@example.com', 'password' => 'x'])
        ->assertTooManyRequests()
        ->assertJsonPath('code', 'too_many_requests');
});

test('refresh is capped at 60 a minute per IP', function () {
    foreach (range(1, 60) as $_) {
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => 'made-up'])->assertUnauthorized();
    }

    $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => 'made-up'])->assertTooManyRequests();
});

test('sensitive account actions are capped at 5 a minute per user', function () {
    Storage::fake('local', ['serve' => true]);
    Sanctum::actingAs($user = User::factory()->create());
    foreach (range(1, 5) as $_) {
        $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('a.jpg', 100, 100)])->assertOk();
    }

    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('a.jpg', 100, 100)])
        ->assertTooManyRequests();
    // The cap is per user: someone else is unaffected.
    Sanctum::actingAs(User::factory()->create());
    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('a.jpg', 100, 100)])->assertOk();
});

test('the shared cap covers deleting the account, setting a PIN and signing out everywhere', function () {
    Sanctum::actingAs(User::factory()->create());
    foreach (range(1, 5) as $_) {
        $this->postJson(route('api.v1.auth.logout-all'), ['password' => 'password'])->assertNoContent();
    }

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'])->assertTooManyRequests();
    $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'password'])->assertTooManyRequests();
});
