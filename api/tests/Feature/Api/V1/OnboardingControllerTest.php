<?php

use App\Models\Baby;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('saves and returns the step reached', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson(route('api.v1.onboarding.show'))->assertExactJson(['data' => ['last_step' => null, 'completed_at' => null]]);
    $this->putJson(route('api.v1.onboarding.update'), ['last_step' => 'sleep'])->assertOk()->assertJsonPath('data.last_step', 'sleep');
    $this->getJson(route('api.v1.onboarding.show'))->assertJsonPath('data.last_step', 'sleep');
});

test('only accepts known steps', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.onboarding.update'), ['last_step' => 'made_up'])
        ->assertJsonPath('errors.last_step', ['in']);
});

test('completing needs a baby', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson(route('api.v1.onboarding.complete'))->assertUnprocessable()->assertExactJson(['code' => 'baby_required']);

    Baby::factory()->create()->users()->attach($user, ['role' => Baby::ROLE_OWNER]);
    $this->postJson(route('api.v1.onboarding.complete'))->assertOk()->assertJsonPath('data.last_step', 'paywall');
    $this->getJson(route('api.v1.me'))->assertJsonPath('data.onboarding.completed', true);
});

test('babies take the onboarding answers', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson(route('api.v1.babies.store'), [
        'name' => 'Ada', 'birth_date' => now()->subMonths(3)->toDateString(), 'timezone' => 'Europe/London',
        'feeding_method' => 'combination', 'usual_wake_time' => '06:30',
    ])
        ->assertCreated()
        ->assertJsonPath('data.feeding_method', 'combination')
        ->assertJsonPath('data.usual_wake_time', '06:30');

    $this->postJson(route('api.v1.babies.store'), [
        'name' => 'Ada', 'birth_date' => now()->toDateString(), 'timezone' => 'Europe/London', 'feeding_method' => 'juice',
    ])->assertJsonPath('errors.feeding_method', ['in']);
});
