<?php

use App\Models\Baby;
use App\Models\User;
use App\Policies\BabyPolicy;

test('grants by role', function (?string $role, string $ability, int|bool $expected) {
    $user = User::factory()->create();
    $baby = Baby::factory()->create();
    if ($role) {
        $baby->users()->attach($user, ['role' => $role]);
    }

    $response = (new BabyPolicy)->{$ability}($user, $baby);

    // true = allowed, 403 = denied, 404 = denied as not found.
    $expected === true
        ? expect($response->allowed())->toBeTrue()
        : expect($response->denied())->toBeTrue()->and($response->status() ?? 403)->toBe($expected);
})->with([
    'owner views' => ['owner', 'view', true],
    'owner updates' => ['owner', 'update', true],
    'owner deletes' => ['owner', 'delete', true],
    'caregiver views' => ['caregiver', 'view', true],
    'caregiver updates' => ['caregiver', 'update', true],
    'caregiver cannot delete' => ['caregiver', 'delete', 403],
    'stranger cannot view' => [null, 'view', 404],
    'stranger cannot update' => [null, 'update', 404],
    'stranger cannot delete' => [null, 'delete', 404],
]);
