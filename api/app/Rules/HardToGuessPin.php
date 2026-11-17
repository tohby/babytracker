<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Rejects PINs people guess first: one repeated digit (111111) or a straight run (123456, 987654).
 * Fails with the code `hard_to_guess_pin`.
 */
class HardToGuessPin implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $pin = (string) $value;
        if (strlen($pin) < 2 || ! ctype_digit($pin)) {
            return; // `digits` reports the format problem.
        }

        $steps = [];
        for ($i = 1; $i < strlen($pin); $i++) {
            $steps[] = (int) $pin[$i] - (int) $pin[$i - 1];
        }
        $steps = array_unique($steps);

        if (count($steps) === 1 && in_array($steps[0], [0, 1, -1], true)) {
            $fail('hard_to_guess_pin');
        }
    }
}
