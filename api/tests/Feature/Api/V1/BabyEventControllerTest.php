<?php

use App\Models\Baby;
use App\Models\BabyEvent;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

function eventBaby(User $user): Baby
{
    $baby = Baby::factory()->create();
    $baby->users()->attach($user, ['role' => Baby::ROLE_OWNER]);

    return $baby;
}

function eventInput(array $overrides = []): array
{
    return [
        'mutation_id' => (string) Str::uuid(),
        'type' => 'feed',
        'occurred_at' => '2026-11-19T10:00:00Z',
        'ended_at' => null,
        'payload' => ['amount_ml' => 90],
        'note' => null,
        'deleted' => false,
        ...$overrides,
    ];
}

test('requires authentication and hides another family events', function () {
    $baby = eventBaby(User::factory()->create());
    $url = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);

    $this->putJson($url, eventInput())->assertUnauthorized();
    Sanctum::actingAs(User::factory()->create());
    $this->putJson($url, eventInput())->assertNotFound();
    $this->getJson(route('api.v1.babies.events.index', $baby))->assertNotFound();
});

test('creates UUID events, accepts all app log types, and validates the contract', function () {
    $user = User::factory()->create(['name' => 'Tobi']);
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $url = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);

    $this->putJson($url, [])->assertUnprocessable();
    $this->putJson($url, eventInput(['type' => 'unknown']))->assertUnprocessable();
    foreach (['feed', 'sleep', 'nappy', 'nursing', 'pumping', 'solids', 'medicine', 'growth', 'bath', 'tummy', 'activity'] as $type) {
        $response = $this->putJson(route('api.v1.babies.events.upsert', [$baby, Str::uuid()]), eventInput(['type' => $type]));
        $response->assertOk()->assertJsonPath('data.type', $type)->assertJsonPath('data.logged_by', $user->id)
            ->assertJsonPath('data.logged_by_name', 'Tobi');
    }
    $this->assertDatabaseCount('baby_events', 11);
});

test('a retry returns its original receipt without overwriting a newer edit', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $url = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);
    $first = eventInput();
    $original = $this->putJson($url, $first)->assertOk()->json('data');
    $this->putJson($url, eventInput(['note' => 'updated']))->assertJsonPath('data.change_number', 2);

    $retry = $this->putJson($url, $first)->assertOk()->json('data');
    expect($retry)->toEqualCanonicalizing($original);
    $this->getJson(route('api.v1.babies.events.index', $baby))
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.note', 'updated');
    expect($baby->fresh()->event_change_number)->toBe(2);
});

test('catch-up pages latest snapshots in server order and includes tombstones', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $firstUrl = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);
    $secondUrl = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);
    $this->putJson($firstUrl, eventInput())->assertOk();
    $this->putJson($secondUrl, eventInput())->assertOk();
    $this->putJson($firstUrl, eventInput(['deleted' => true]))->assertOk();
    $feedUrl = route('api.v1.babies.events.index', $baby);

    $this->getJson($feedUrl.'?after=0&limit=1')->assertOk()
        ->assertJsonPath('data.0.change_number', 2)
        ->assertJsonPath('next_cursor', 2)->assertJsonPath('has_more', true);
    $this->getJson($feedUrl.'?after=2&limit=1')->assertOk()
        ->assertJsonPath('data.0.change_number', 3)
        ->assertJsonPath('has_more', false);
    $this->getJson($feedUrl.'?after=3')->assertOk()->assertJsonCount(0, 'data')
        ->assertJsonPath('next_cursor', 3);
});

test('caregivers can write and read while each baby keeps its own sequence', function () {
    $owner = User::factory()->create();
    $caregiver = User::factory()->create(['name' => 'Partner']);
    $firstBaby = eventBaby($owner);
    $firstBaby->users()->attach($caregiver, ['role' => Baby::ROLE_CAREGIVER]);
    $secondBaby = eventBaby($caregiver);
    Sanctum::actingAs($caregiver);

    $this->putJson(route('api.v1.babies.events.upsert', [$firstBaby, Str::uuid()]), eventInput())
        ->assertOk()->assertJsonPath('data.change_number', 1)
        ->assertJsonPath('data.logged_by_name', 'Partner');
    $this->putJson(route('api.v1.babies.events.upsert', [$secondBaby, Str::uuid()]), eventInput())
        ->assertOk()->assertJsonPath('data.change_number', 1);
    $this->getJson(route('api.v1.babies.events.index', $firstBaby))
        ->assertOk()->assertJsonCount(1, 'data');
});

test('mutation IDs cannot be reused for another event', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $input = eventInput();
    $this->putJson(route('api.v1.babies.events.upsert', [$baby, Str::uuid()]), $input)->assertOk();
    $this->putJson(route('api.v1.babies.events.upsert', [$baby, Str::uuid()]), $input)
        ->assertConflict()->assertJsonPath('code', 'mutation_id_conflict');
    expect($baby->fresh()->event_change_number)->toBe(1);
});

test('rejects an invalid event ID with 404 and leaves the sequence untouched', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);

    $this->putJson("/api/v1/babies/{$baby->id}/events/not-a-uuid", eventInput())
        ->assertNotFound();
    expect($baby->fresh()->event_change_number)->toBe(0);
});

test('bounds payloads while accepting empty and nested event objects', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $url = route('api.v1.babies.events.upsert', [$baby, Str::uuid()]);

    $emptyPayloadResponse = $this->putJson($url, eventInput(['payload' => []]))->assertOk();
    expect(json_decode($emptyPayloadResponse->getContent())->data->payload)->toBeInstanceOf(stdClass::class);
    $this->putJson($url, eventInput(['payload' => ['details' => ['side' => 'left']]]))->assertOk();
    $this->putJson($url, eventInput(['payload' => ['data' => str_repeat('x', 16385)]]))
        ->assertUnprocessable()->assertJsonPath('errors.payload', ['event_payload']);
    $this->putJson($url, eventInput(['payload' => range(1, 2)]))
        ->assertUnprocessable()->assertJsonPath('errors.payload', ['event_payload']);
    expect($baby->fresh()->event_change_number)->toBe(2);
});

test('persists a tombstone and returns it on later catch-up requests', function () {
    $user = User::factory()->create();
    $baby = eventBaby($user);
    Sanctum::actingAs($user);
    $eventId = (string) Str::uuid();
    $url = route('api.v1.babies.events.upsert', [$baby, $eventId]);
    $this->putJson($url, eventInput())->assertOk();

    $deleted = $this->putJson($url, eventInput(['deleted' => true]))->assertOk()->json('data');
    expect($deleted['deleted_at'])->not->toBeNull();
    expect(BabyEvent::findOrFail($eventId)->deleted_at)->not->toBeNull();
    $this->getJson(route('api.v1.babies.events.index', $baby).'?after=1')
        ->assertOk()->assertJsonPath('data.0.id', $eventId)
        ->assertJsonPath('data.0.deleted_at', $deleted['deleted_at'])
        ->assertJsonPath('data.0.change_number', 2);
});
