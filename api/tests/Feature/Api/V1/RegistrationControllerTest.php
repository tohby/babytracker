<?php

use App\Models\Device;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Notifications\AccountAlreadyExists;
use App\Notifications\RegistrationCode;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rules\Password;

function sentCode(string $email): string
{
    $code = null;
    Notification::assertSentTo(
        new AnonymousNotifiable,
        RegistrationCode::class,
        function (RegistrationCode $n, array $channels, AnonymousNotifiable $to) use ($email, &$code) {
            if ($to->routes['mail'] !== $email) {
                return false;
            }
            $code = $n->code;

            return true;
        },
    );

    return $code;
}

beforeEach(fn () => Notification::fake());

test('production password rules require at least eight characters', function () {
    $environment = $this->app['env'];
    $this->app['env'] = 'production';

    try {
        expect(Password::defaults()->toPasswordRulesString())->toContain('minlength: 8;');
    } finally {
        $this->app['env'] = $environment;
    }
});

$valid = fn (array $overrides = []) => [
    'email' => 'Kemi@Example.com',
    'password' => 'a-long-password',
    'locale' => 'en-GB',
    'consent' => true,
    ...$overrides,
];

test('register sends a code and creates no account yet', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid())
        ->assertAccepted()
        ->assertExactJson(['status' => 'verification_sent']);

    expect(User::count())->toBe(0)
        ->and(PendingRegistration::sole()->email)->toBe('kemi@example.com')
        ->and(sentCode('kemi@example.com'))->toMatch('/^\d{6}$/');
});

test('register answers the same for an existing account, and emails them instead', function () use ($valid) {
    $user = User::factory()->create(['email' => 'kemi@example.com']);

    $this->postJson(route('api.v1.auth.register'), $valid())
        ->assertAccepted()
        ->assertExactJson(['status' => 'verification_sent']);

    expect(PendingRegistration::count())->toBe(0);
    Notification::assertSentTo(new AnonymousNotifiable, AccountAlreadyExists::class);
    Notification::assertNotSentTo(new AnonymousNotifiable, RegistrationCode::class);
});

test('register needs consent to store health data', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid(['consent' => false]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.consent', ['accepted']);
});

test('register rejects missing fields with rule codes', function () {
    $this->postJson(route('api.v1.auth.register'), [])
        ->assertUnprocessable()
        ->assertExactJson([
            'code' => 'validation_failed',
            'errors' => ['email' => ['required'], 'password' => ['required'], 'consent' => ['accepted']],
        ]);
});

test('the right code creates a verified account and signs the phone in', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid());

    $json = $this->postJson(route('api.v1.auth.register.verify'), [
        'email' => 'kemi@example.com', 'code' => sentCode('kemi@example.com'), 'platform' => 'android',
    ])
        ->assertCreated()
        ->assertJsonPath('user.email', 'kemi@example.com')
        ->assertJsonPath('user.email_verified', true)
        ->assertJsonPath('user.name', null)
        ->assertJsonStructure(['access_token', 'refresh_token', 'device' => ['id', 'secret']])
        ->json();

    $user = User::sole();
    expect($user->health_consent_at)->not->toBeNull()
        ->and($user->privacy_policy_version)->toBe(config('nappa.privacy_policy_version'))
        ->and(PendingRegistration::count())->toBe(0)
        ->and(Device::sole()->platform)->toBe('android');

    $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'a-long-password'])
        ->assertOk();
    $this->getJson(route('api.v1.me'), bearer($json['access_token']))->assertOk();
});

test('a wrong code is refused, and five wrong codes end the sign-up', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid());
    $code = sentCode('kemi@example.com');
    $wrong = $code === '000000' ? '111111' : '000000';

    foreach (range(1, 5) as $_) {
        $this->postJson(route('api.v1.auth.register.verify'), ['email' => 'kemi@example.com', 'code' => $wrong])
            ->assertUnprocessable()
            ->assertExactJson(['code' => 'invalid_code']);
    }

    $this->postJson(route('api.v1.auth.register.verify'), ['email' => 'kemi@example.com', 'code' => $code])
        ->assertExactJson(['code' => 'invalid_code']);
    expect(User::count())->toBe(0);
});

test('an expired code is refused', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid());
    $code = sentCode('kemi@example.com');

    $this->travel(16)->minutes();

    $this->postJson(route('api.v1.auth.register.verify'), ['email' => 'kemi@example.com', 'code' => $code])
        ->assertExactJson(['code' => 'invalid_code']);
});

test('resend replaces the code and always answers 202', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid());
    $old = PendingRegistration::sole()->code_hash;

    $this->travel(61)->seconds();
    $this->postJson(route('api.v1.auth.register.resend'), ['email' => 'kemi@example.com'])->assertAccepted();
    $this->postJson(route('api.v1.auth.register.resend'), ['email' => 'nobody@example.com'])->assertAccepted();

    expect(PendingRegistration::sole()->code_hash)->not->toBe($old);
});

test('resend is limited to once a minute per email', function () use ($valid) {
    $this->postJson(route('api.v1.auth.register'), $valid());

    $this->postJson(route('api.v1.auth.register.resend'), ['email' => 'kemi@example.com'])->assertAccepted();
    $this->postJson(route('api.v1.auth.register.resend'), ['email' => 'kemi@example.com'])
        ->assertTooManyRequests()
        ->assertJsonPath('code', 'too_many_requests');
});
