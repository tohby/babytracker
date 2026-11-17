<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

describe('register', function () {
    test('creates a user and returns a token', function () {
        $response = $this->postJson(route('api.v1.auth.register'), [
            'name' => 'Kemi Ade',
            'email' => 'kemi@example.com',
            'password' => 'password',
            'device_name' => 'iPhone 17',
            'locale' => 'en-GB',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'kemi@example.com')
            ->assertJsonPath('user.locale', 'en-GB')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'email_verified', 'locale']]);

        $user = User::firstWhere('email', 'kemi@example.com');
        expect($user->tokens()->sole()->name)->toBe('iPhone 17');
        $this->getJson(route('api.v1.me'), ['Authorization' => 'Bearer '.$response->json('token')])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    });

    test('returns 422 with rule codes when fields are missing', function () {
        $this->postJson(route('api.v1.auth.register'), [])
            ->assertUnprocessable()
            ->assertExactJson([
                'code' => 'validation_failed',
                'errors' => [
                    'name' => ['required'],
                    'email' => ['required'],
                    'password' => ['required'],
                    'device_name' => ['required'],
                ],
            ]);
    });

    test('returns 422 when the email is already registered', function () {
        User::factory()->create(['email' => 'kemi@example.com']);

        $this->postJson(route('api.v1.auth.register'), [
            'name' => 'Kemi Ade',
            'email' => 'kemi@example.com',
            'password' => 'password',
            'device_name' => 'iPhone 17',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email', ['unique']);
    });

    test('returns 422 for a malformed locale', function () {
        $this->postJson(route('api.v1.auth.register'), [
            'name' => 'Kemi Ade',
            'email' => 'kemi@example.com',
            'password' => 'password',
            'device_name' => 'iPhone 17',
            'locale' => 'not a locale!',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.locale', ['regex']);
    });
});

describe('login', function () {
    test('returns a token for the right password', function () {
        $user = User::factory()->create(['email' => 'kemi@example.com']);

        $this->postJson(route('api.v1.auth.login'), [
            'email' => 'kemi@example.com',
            'password' => 'password',
            'device_name' => 'Pixel 10',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonStructure(['token']);

        expect($user->tokens()->sole()->name)->toBe('Pixel 10');
    });

    test('returns 401 invalid_credentials for a wrong password', function () {
        User::factory()->create(['email' => 'kemi@example.com']);

        $this->postJson(route('api.v1.auth.login'), [
            'email' => 'kemi@example.com',
            'password' => 'wrong-password',
            'device_name' => 'Pixel 10',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('returns 401 invalid_credentials for an unknown email', function () {
        $this->postJson(route('api.v1.auth.login'), [
            'email' => 'nobody@example.com',
            'password' => 'password',
            'device_name' => 'Pixel 10',
        ])
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('returns 429 after too many attempts for one email', function () {
        foreach (range(1, 10) as $_) {
            $this->postJson(route('api.v1.auth.login'), [
                'email' => 'kemi@example.com', 'password' => 'x', 'device_name' => 'Pixel 10',
            ]);
        }

        $this->postJson(route('api.v1.auth.login'), [
            'email' => 'kemi@example.com', 'password' => 'x', 'device_name' => 'Pixel 10',
        ])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'too_many_requests');
    });
});

describe('logout', function () {
    test('revokes only the current device token', function () {
        $user = User::factory()->create();
        $phone = $user->createToken('phone')->plainTextToken;
        $user->createToken('tablet');

        $this->postJson(route('api.v1.auth.logout'), [], ['Authorization' => 'Bearer '.$phone])
            ->assertNoContent();

        expect($user->tokens()->pluck('name')->all())->toBe(['tablet']);
    });
});

describe('me', function () {
    test('returns 401 unauthenticated without a token', function () {
        $this->getJson(route('api.v1.me'))
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'unauthenticated']);
    });

    test('returns the signed-in user', function () {
        $user = User::factory()->create(['locale' => 'en-US']);
        Sanctum::actingAs($user);

        $this->getJson(route('api.v1.me'))
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonPath('data.locale', 'en-US')
            ->assertJsonMissingPath('data.password');
    });
});
