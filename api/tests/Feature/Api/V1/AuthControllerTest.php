<?php

use App\Models\Device;
use App\Models\RefreshToken;
use App\Models\User;

describe('login', function () {
    test('returns tokens, a new remembered device and the user', function () {
        $user = User::factory()->create(['email' => 'kemi@example.com']);

        $json = $this->postJson(route('api.v1.auth.login'), [
            'email' => ' Kemi@Example.com ', 'password' => 'password', 'platform' => 'ios',
        ])
            ->assertOk()
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('expires_in', 1800)
            ->assertJsonPath('device.pin_enabled', false)
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['access_token', 'refresh_token', 'refresh_expires_at', 'device' => ['id', 'secret']])
            ->json();

        $device = Device::sole();
        expect($device->user_id)->toBe($user->id)
            ->and($device->platform)->toBe('ios')
            ->and($device->secret_hash)->toBe(hash('sha256', $json['device']['secret']))
            ->and(RefreshToken::sole()->token_hash)->toBe(hash('sha256', $json['refresh_token']));

        $this->getJson(route('api.v1.me'), bearer($json['access_token']))
            ->assertOk()
            ->assertJsonPath('meta.device.id', $device->id);
    });

    test('reuses the remembered device when the phone sends its id and secret', function () {
        $user = User::factory()->create();
        $first = apiSignIn($user);

        $this->postJson(route('api.v1.auth.login'), [
            'email' => $user->email,
            'password' => 'password',
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
        ])
            ->assertOk()
            ->assertJsonPath('device.id', $first['device']['id'])
            ->assertJsonMissingPath('device.secret');

        expect(Device::count())->toBe(1);
    });

    test('returns 401 invalid_credentials for a wrong password', function () {
        User::factory()->create(['email' => 'kemi@example.com']);

        $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'wrong'])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('answers an unknown email exactly like a wrong password', function () {
        $this->postJson(route('api.v1.auth.login'), ['email' => 'nobody@example.com', 'password' => 'password'])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('pauses the account for a minute after 5 wrong passwords, even with the right one', function () {
        User::factory()->create(['email' => 'kemi@example.com']);
        foreach (range(1, 5) as $_) {
            $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'wrong'])
                ->assertUnauthorized();
        }

        $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'password'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'too_many_attempts')
            ->assertJsonPath('retry_after', 60)
            ->assertHeader('Retry-After', '60');

        $this->travel(61)->seconds();

        $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'password'])
            ->assertOk();
    });

    test('pauses longer after 10 failures', function () {
        User::factory()->create(['email' => 'kemi@example.com']);
        foreach (range(1, 10) as $i) {
            if ($i === 6) {
                $this->travel(61)->seconds();
            }
            $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'wrong']);
        }

        $this->postJson(route('api.v1.auth.login'), ['email' => 'kemi@example.com', 'password' => 'password'])
            ->assertTooManyRequests()
            ->assertJsonPath('retry_after', 300);
    });

    test('pauses unknown emails too, so the pause does not reveal accounts', function () {
        foreach (range(1, 5) as $_) {
            $this->postJson(route('api.v1.auth.login'), ['email' => 'nobody@example.com', 'password' => 'x']);
        }

        $this->postJson(route('api.v1.auth.login'), ['email' => 'nobody@example.com', 'password' => 'x'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'too_many_attempts');
    });
});

describe('device login (password only)', function () {
    test('signs a remembered phone in without the email', function () {
        $user = User::factory()->create();
        $first = apiSignIn($user);

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('device.id', $first['device']['id']);
    });

    test('rejects a wrong password', function () {
        $first = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'wrong',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('rejects a wrong device secret as device_revoked', function () {
        $first = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => 'not-the-secret',
            'password' => 'password',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'device_revoked']);
    });

    test('rejects a revoked device', function () {
        $first = apiSignIn(User::factory()->create());
        Device::query()->update(['revoked_at' => now()]);

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'password',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'device_revoked']);
    });

    test('shares the pause with the email form for the same account', function () {
        $user = User::factory()->create();
        $first = apiSignIn($user);
        foreach (range(1, 5) as $_) {
            $this->postJson(route('api.v1.auth.login'), ['email' => $user->email, 'password' => 'wrong']);
        }

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'password',
        ])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'too_many_attempts');
    });
});

describe('refresh', function () {
    test('trades a refresh token for new tokens, once', function () {
        $first = apiSignIn(User::factory()->create());

        $second = $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])
            ->assertOk()
            ->assertJsonStructure(['access_token', 'refresh_token'])
            ->json();

        expect($second['refresh_token'])->not->toBe($first['refresh_token']);
        $this->getJson(route('api.v1.me'), bearer($second['access_token']))->assertOk();
    });

    test('a replayed refresh token signs the device out (theft detection)', function () {
        $first = apiSignIn(User::factory()->create());
        $second = $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])->json();

        $this->travel(30)->seconds();
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'refresh_invalid']);

        // The thief's copy is useless, and so is the newer token: the phone must sign in again.
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $second['refresh_token']])
            ->assertUnauthorized();
        $this->getJson(route('api.v1.me'), bearer($second['access_token']))->assertUnauthorized();
    });

    test('a quick retry of the same token is refused without signing out', function () {
        $first = apiSignIn(User::factory()->create());
        $second = $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])->json();

        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])
            ->assertUnauthorized();
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $second['refresh_token']])
            ->assertOk();
    });

    test('an expired refresh token returns refresh_invalid', function () {
        $first = apiSignIn(User::factory()->create());

        $this->travel(61)->days();

        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'refresh_invalid']);
    });

    test('stops at one year even when used every day', function () {
        $tokens = apiSignIn(User::factory()->create());
        foreach (range(1, 6) as $_) {
            $this->travel(55)->days();
            $tokens = $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $tokens['refresh_token']])
                ->assertOk()->json();
        }

        $this->travel(55)->days(); // 385 days after sign-in
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $tokens['refresh_token']])
            ->assertUnauthorized();
    });

    test('access tokens expire after 30 minutes', function () {
        $first = apiSignIn(User::factory()->create());

        $this->travel(31)->minutes();

        $this->getJson(route('api.v1.me'), bearer($first['access_token']))
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'unauthenticated']);
    });

    test('rejects an unknown token', function () {
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => 'made-up'])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'refresh_invalid']);
    });
});

describe('logout', function () {
    test('signs this phone out but keeps it remembered for a password-only sign-in', function () {
        $first = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.logout'), [], bearer($first['access_token']))->assertNoContent();

        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $first['refresh_token']])->assertUnauthorized();
        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'password',
        ])->assertOk();
    });

    test('forget_device also forgets the phone', function () {
        $first = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.logout'), ['forget_device' => true], bearer($first['access_token']))
            ->assertNoContent();

        $this->postJson(route('api.v1.auth.device-login'), [
            'device_id' => $first['device']['id'],
            'device_secret' => $first['device']['secret'],
            'password' => 'password',
        ])->assertExactJson(['code' => 'device_revoked']);
    });

    test('leaves other phones signed in', function () {
        $user = User::factory()->create();
        $phone = apiSignIn($user);
        $tablet = apiSignIn($user);

        $this->postJson(route('api.v1.auth.logout'), [], bearer($phone['access_token']))->assertNoContent();

        $this->getJson(route('api.v1.me'), bearer($tablet['access_token']))->assertOk();
    });
});

describe('logout everywhere', function () {
    test('signs out and forgets every phone', function () {
        $user = User::factory()->create();
        $phone = apiSignIn($user);
        $tablet = apiSignIn($user);

        $this->postJson(route('api.v1.auth.logout-all'), ['password' => 'password'], bearer($phone['access_token']))
            ->assertNoContent();

        $this->getJson(route('api.v1.me'), bearer($tablet['access_token']))->assertUnauthorized();
        $this->postJson(route('api.v1.auth.refresh'), ['refresh_token' => $tablet['refresh_token']])->assertUnauthorized();
        expect(Device::whereNull('revoked_at')->count())->toBe(0);
    });

    test('needs the password', function () {
        $phone = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.logout-all'), ['password' => 'wrong'], bearer($phone['access_token']))
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });
});

describe('forget device ("Not you?")', function () {
    test('forgets the phone and always answers 204', function () {
        $first = apiSignIn(User::factory()->create());

        $this->postJson(route('api.v1.auth.forget-device'), [
            'device_id' => $first['device']['id'], 'device_secret' => $first['device']['secret'],
        ])->assertNoContent();
        $this->postJson(route('api.v1.auth.forget-device'), [
            'device_id' => str_repeat('0', 26), 'device_secret' => 'nope',
        ])->assertNoContent();

        expect(Device::sole()->revoked_at)->not->toBeNull();
    });
});

describe('me', function () {
    test('returns 401 unauthenticated without a token', function () {
        $this->getJson(route('api.v1.me'))
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'unauthenticated']);
    });

    test('returns the user without secrets', function () {
        $user = User::factory()->create(['locale' => 'en-US']);
        $tokens = apiSignIn($user);

        $this->getJson(route('api.v1.me'), bearer($tokens['access_token']))
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.avatar_url', null)
            ->assertJsonPath('data.onboarding.completed', false)
            ->assertJsonPath('meta.device.pin_enabled', false)
            ->assertJsonMissingPath('data.password');
    });
});
