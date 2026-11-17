<?php

use App\Models\Baby;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function babyFor(User $user, string $role = Baby::ROLE_OWNER, array $attributes = []): Baby
{
    $baby = Baby::factory()->create($attributes);
    $baby->users()->attach($user, ['role' => $role]);

    return $baby;
}

test('returns 401 without a token', function () {
    $this->getJson(route('api.v1.babies.index'))->assertUnauthorized();
});

describe('index', function () {
    test('lists only babies the user is linked to, with their role', function () {
        $user = User::factory()->create();
        $mine = babyFor($user, attributes: ['name' => 'Ada']);
        $shared = babyFor($user, Baby::ROLE_CAREGIVER, ['name' => 'Tobi']);
        babyFor(User::factory()->create(), attributes: ['name' => 'Someone else']);
        Sanctum::actingAs($user);

        $this->getJson(route('api.v1.babies.index'))
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $mine->id)
            ->assertJsonPath('data.0.role', 'owner')
            ->assertJsonPath('data.1.id', $shared->id)
            ->assertJsonPath('data.1.role', 'caregiver');
    });
});

describe('store', function () {
    test('creates a baby owned by the user', function () {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson(route('api.v1.babies.store'), [
            'name' => 'Ada',
            'birth_date' => '2026-07-01',
            'timezone' => 'Africa/Lagos',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Ada')
            ->assertJsonPath('data.birth_date', '2026-07-01')
            ->assertJsonPath('data.timezone', 'Africa/Lagos')
            ->assertJsonPath('data.role', 'owner');

        $baby = Baby::findOrFail($response->json('data.id'));
        expect($baby->users()->sole()->is($user))->toBeTrue();
    });

    test('returns 422 with rule codes for missing fields', function () {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson(route('api.v1.babies.store'), [])
            ->assertUnprocessable()
            ->assertExactJson([
                'code' => 'validation_failed',
                'errors' => [
                    'name' => ['required'],
                    'birth_date' => ['required'],
                    'timezone' => ['required'],
                ],
            ]);
    });

    test('returns 422 for an invalid birth date or timezone', function (array $input, string $field, string $code) {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson(route('api.v1.babies.store'), [
            'name' => 'Ada',
            'birth_date' => '2026-07-01',
            'timezone' => 'Europe/London',
            ...$input,
        ])
            ->assertUnprocessable()
            ->assertJsonPath("errors.$field", [$code]);
    })->with([
        'wrong date format' => [['birth_date' => '01/07/2026'], 'birth_date', 'date_format'],
        'far in the future' => [['birth_date' => now()->addYear()->toDateString()], 'birth_date', 'before_or_equal'],
        'too long ago' => [['birth_date' => now()->subYears(7)->toDateString()], 'birth_date', 'after_or_equal'],
        'unknown timezone' => [['timezone' => 'Mars/Olympus'], 'timezone', 'timezone'],
    ]);
});

describe('show', function () {
    test('returns the baby to a linked user', function () {
        $user = User::factory()->create();
        $baby = babyFor($user);
        Sanctum::actingAs($user);

        $this->getJson(route('api.v1.babies.show', $baby))
            ->assertOk()
            ->assertJsonPath('data.id', $baby->id);
    });

    test("returns 404 for another family's baby", function () {
        $baby = babyFor(User::factory()->create());
        Sanctum::actingAs(User::factory()->create());

        $this->getJson(route('api.v1.babies.show', $baby))
            ->assertNotFound()
            ->assertExactJson(['code' => 'not_found']);
    });
});

describe('update', function () {
    test('changes only the fields sent', function () {
        $user = User::factory()->create();
        $baby = babyFor($user, attributes: ['name' => 'Ada', 'timezone' => 'Europe/London']);
        Sanctum::actingAs($user);

        $this->patchJson(route('api.v1.babies.update', $baby), ['timezone' => 'America/New_York'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Ada')
            ->assertJsonPath('data.timezone', 'America/New_York');

        expect($baby->fresh()->timezone)->toBe('America/New_York');
    });

    test("returns 404 and leaves another family's baby unchanged", function () {
        $baby = babyFor(User::factory()->create(), attributes: ['name' => 'Ada']);
        Sanctum::actingAs(User::factory()->create());

        $this->patchJson(route('api.v1.babies.update', $baby), ['name' => 'Changed'])->assertNotFound();

        expect($baby->fresh()->name)->toBe('Ada');
    });
});

describe('destroy', function () {
    test('soft deletes the baby for its owner', function () {
        $user = User::factory()->create();
        $baby = babyFor($user);
        Sanctum::actingAs($user);

        $this->deleteJson(route('api.v1.babies.destroy', $baby))->assertNoContent();

        $this->assertSoftDeleted($baby);
        $this->getJson(route('api.v1.babies.index'))->assertJsonCount(0, 'data');
    });

    test('returns 403 forbidden for a caregiver', function () {
        $user = User::factory()->create();
        $baby = babyFor($user, Baby::ROLE_CAREGIVER);
        Sanctum::actingAs($user);

        $this->deleteJson(route('api.v1.babies.destroy', $baby))
            ->assertForbidden()
            ->assertExactJson(['code' => 'forbidden']);

        $this->assertNotSoftDeleted($baby);
    });
});
