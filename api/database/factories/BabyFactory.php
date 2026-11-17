<?php

namespace Database\Factories;

use App\Models\Baby;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Baby>
 */
class BabyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'birth_date' => fake()->dateTimeBetween('-12 months', '-1 week')->format('Y-m-d'),
            'timezone' => 'Europe/London',
        ];
    }
}
