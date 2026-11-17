<?php

use App\Models\Device;
use App\Models\User;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;

function pinLogin(array $device, string $pin): TestResponse
{
    return test()->postJson(route('api.v1.auth.pin-login'), [
        'device_id' => $device['id'], 'device_secret' => $device['secret'], 'pin' => $pin,
    ]);
}

test('a PIN set from Settings signs this phone in', function () {
    $user = User::factory()->create();
    $first = apiSignIn($user);

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'], bearer($first['access_token']))
        ->assertOk()
        ->assertJsonPath('device.pin_enabled', true);

    expect(Device::sole()->pin_hash)->not->toBe('258014');

    pinLogin($first['device'], '258014')
        ->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('device.pin_enabled', true);
});

test('setting a PIN needs the password', function () {
    $first = apiSignIn(User::factory()->create());

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'wrong', 'pin' => '258014'], bearer($first['access_token']))
        ->assertUnauthorized()
        ->assertExactJson(['code' => 'invalid_credentials']);
});

test('easy-to-guess PINs are refused', function (string $pin) {
    $first = apiSignIn(User::factory()->create());

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => $pin], bearer($first['access_token']))
        ->assertUnprocessable()
        ->assertJsonPath('errors.pin', ['hard_to_guess_pin']);
})->with(['111111', '123456', '987654', '000000']);

test('a PIN must be 6 digits', function () {
    $first = apiSignIn(User::factory()->create());

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '1234'], bearer($first['access_token']))
        ->assertJsonPath('errors.pin', ['digits']);
});

test('a token without a device cannot hold a PIN', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'])
        ->assertStatus(409)
        ->assertExactJson(['code' => 'device_required']);
});

test('a wrong PIN says how many tries are left; five turn the PIN off', function () {
    $first = apiSignIn(User::factory()->create());
    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'], bearer($first['access_token']));

    pinLogin($first['device'], '111222')
        ->assertUnauthorized()
        ->assertExactJson(['code' => 'invalid_pin', 'attempts_left' => 4]);
    foreach (range(1, 3) as $_) {
        pinLogin($first['device'], '111222');
    }
    // The 5th failure also starts the 1-minute pause; the PIN is off either way.
    pinLogin($first['device'], '111222')->assertExactJson(['code' => 'pin_disabled']);

    $this->travel(61)->seconds();
    pinLogin($first['device'], '258014')->assertStatus(409)->assertExactJson(['code' => 'pin_not_set']);

    // The password still works on this phone.
    $this->postJson(route('api.v1.auth.device-login'), [
        'device_id' => $first['device']['id'], 'device_secret' => $first['device']['secret'], 'password' => 'password',
    ])->assertOk()->assertJsonPath('device.pin_enabled', false);
});

test('a PIN only works with the phone it was set on', function () {
    $user = User::factory()->create();
    $phone = apiSignIn($user);
    $tablet = apiSignIn($user);
    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'], bearer($phone['access_token']));

    pinLogin($tablet['device'], '258014')->assertStatus(409)->assertExactJson(['code' => 'pin_not_set']);
    pinLogin(['id' => $phone['device']['id'], 'secret' => 'stolen-id-only'], '258014')
        ->assertExactJson(['code' => 'device_revoked']);
});

test('turning the PIN off from Settings', function () {
    $first = apiSignIn(User::factory()->create());
    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'], bearer($first['access_token']));

    $this->deleteJson(route('api.v1.me.pin.destroy'), [], bearer($first['access_token']))->assertNoContent();

    pinLogin($first['device'], '258014')->assertExactJson(['code' => 'pin_not_set']);
});

test('signing out everywhere removes PINs', function () {
    $first = apiSignIn(User::factory()->create());
    $this->putJson(route('api.v1.me.pin.store'), ['password' => 'password', 'pin' => '258014'], bearer($first['access_token']));

    $this->postJson(route('api.v1.auth.logout-all'), ['password' => 'password'], bearer($first['access_token']));

    pinLogin($first['device'], '258014')->assertExactJson(['code' => 'device_revoked']);
    expect(Device::sole()->pin_hash)->toBeNull();
});
