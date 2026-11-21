<?php

use App\Auth\DeviceSessions;
use App\Models\Baby;
use App\Models\Device;
use App\Models\User;
use App\Notifications\AccountDeletionCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

test('saves the name from onboarding, and allows clearing it', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->patchJson(route('api.v1.me.update'), ['name' => 'Kemi'])->assertOk()->assertJsonPath('data.name', 'Kemi');
    $this->patchJson(route('api.v1.me.update'), ['name' => null])->assertOk()->assertJsonPath('data.name', null);
});

describe('delete account', function () {
    test('deletes the account, its devices and babies only it can see', function () {
        $user = User::factory()->create();
        $tokens = apiSignIn($user);
        $own = Baby::factory()->create();
        $own->users()->attach($user, ['role' => Baby::ROLE_OWNER]);
        $shared = Baby::factory()->create();
        $shared->users()->attach($user, ['role' => Baby::ROLE_OWNER]);
        $shared->users()->attach($partner = User::factory()->create(), ['role' => Baby::ROLE_CAREGIVER]);

        $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'password'], bearer($tokens['access_token']))
            ->assertNoContent();

        expect(User::find($user->id))->toBeNull()
            ->and(Device::count())->toBe(0)
            ->and(Baby::withTrashed()->find($own->id))->toBeNull()
            ->and($shared->fresh()->users->pluck('id')->all())->toBe([$partner->id]);
    });

    test('needs the password', function () {
        $tokens = apiSignIn(User::factory()->create());

        $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'wrong'], bearer($tokens['access_token']))
            ->assertUnauthorized()
            ->assertExactJson(['code' => 'invalid_credentials']);
    });

    test('a passwordless account can delete itself with an email code scoped to its device', function () {
        Notification::fake();
        $user = User::factory()->create(['password' => null]);
        $sessions = app(DeviceSessions::class);
        [$firstDevice, $secret] = $sessions->createDevice($user, 'ios');
        [$secondDevice, $otherSecret] = $sessions->createDevice($user, 'ios');
        $first = $sessions->signIn($firstDevice, $secret)['access_token'];
        $second = $sessions->signIn($secondDevice, $otherSecret)['access_token'];

        $this->getJson(route('api.v1.me'), bearer($first))->assertOk()->assertJsonPath('data.has_password', false);
        $this->postJson('/api/v1/me/delete-code', [], bearer($first))->assertAccepted()
            ->assertExactJson(['status' => 'verification_sent']);
        $code = Notification::sent(new AnonymousNotifiable, AccountDeletionCode::class)->sole()->code;

        $this->deleteJson(route('api.v1.me.destroy'), ['code' => $code], bearer($second))
            ->assertUnprocessable()->assertExactJson(['code' => 'invalid_code']);
        $this->deleteJson(route('api.v1.me.destroy'), ['code' => $code === '000000' ? '111111' : '000000'], bearer($first))
            ->assertUnprocessable()->assertExactJson(['code' => 'invalid_code']);
        expect(User::find($user->id))->not->toBeNull();
        $this->deleteJson(route('api.v1.me.destroy'), ['code' => $code], bearer($first))->assertNoContent();
        expect(User::find($user->id))->toBeNull()->and(Device::count())->toBe(0);
        $this->deleteJson(route('api.v1.me.destroy'), ['code' => $code], bearer($first))->assertUnauthorized();
    });

    test('a passwordless account receives an expiry code and resend limits', function () {
        Notification::fake();
        $user = User::factory()->create(['password' => null]);
        $sessions = app(DeviceSessions::class);
        [$device, $secret] = $sessions->createDevice($user, 'ios');
        $token = $sessions->signIn($device, $secret)['access_token'];
        $this->freezeTime();

        $this->postJson('/api/v1/me/delete-code', [], bearer($token))->assertAccepted();
        $this->postJson('/api/v1/me/delete-code', [], bearer($token))->assertTooManyRequests();
        $code = Notification::sent(new AnonymousNotifiable, AccountDeletionCode::class)->sole()->code;

        $this->travel(10)->minutes();
        $this->deleteJson(route('api.v1.me.destroy'), ['code' => $code], bearer($token))
            ->assertUnprocessable()->assertExactJson(['code' => 'code_expired']);
        expect(User::find($user->id))->not->toBeNull();
    });

    test('password accounts continue to require the password for deletion', function () {
        Notification::fake();
        $tokens = apiSignIn(User::factory()->create());
        expect($tokens['user']['has_password'])->toBeTrue();

        $this->postJson('/api/v1/me/delete-code', [], bearer($tokens['access_token']))
            ->assertConflict()->assertExactJson(['code' => 'password_required']);
        $this->deleteJson(route('api.v1.me.destroy'), ['code' => '123456'], bearer($tokens['access_token']))
            ->assertUnprocessable()->assertJsonPath('errors.password', ['required']);
        Notification::assertNothingSent();
    });
});

describe('avatar', function () {
    beforeEach(fn () => Storage::fake('local', ['serve' => true]));

    test('upload stores a 512px square JPEG and returns a link', function () {
        Sanctum::actingAs($user = User::factory()->create());

        $url = $this->postJson(route('api.v1.me.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('me.png', 1200, 800),
        ])->assertOk()->json('data.avatar_url');

        $path = $user->fresh()->avatar_path;
        Storage::disk('local')->assertExists($path);
        $size = getimagesizefromstring(Storage::disk('local')->get($path));
        expect($url)->toBeString()
            ->and($path)->toEndWith('.jpg')
            ->and([$size[0], $size[1], $size['mime']])->toBe([512, 512, 'image/jpeg']);
    });

    test('a new upload replaces the old file', function () {
        Sanctum::actingAs($user = User::factory()->create());
        $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('a.jpg', 300, 300)]);
        $old = $user->fresh()->avatar_path;

        $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('b.jpg', 300, 300)]);

        Storage::disk('local')->assertMissing($old);
        expect($user->fresh()->avatar_path)->not->toBe($old);
    });

    test('rejects files that are not images', function () {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson(route('api.v1.me.avatar.store'), [
            'avatar' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'),
        ])->assertUnprocessable()->assertJsonPath('errors.avatar', ['mimes']);
    });

    test('removing it falls back to the initials chip', function () {
        Sanctum::actingAs($user = User::factory()->create());
        $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => UploadedFile::fake()->image('a.jpg', 300, 300)]);
        $path = $user->fresh()->avatar_path;

        $this->deleteJson(route('api.v1.me.avatar.destroy'))->assertOk()->assertJsonPath('data.avatar_url', null);

        Storage::disk('local')->assertMissing($path);
    });
});
