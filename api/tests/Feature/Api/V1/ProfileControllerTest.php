<?php

use App\Models\Baby;
use App\Models\Device;
use App\Models\User;
use Illuminate\Http\UploadedFile;
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
