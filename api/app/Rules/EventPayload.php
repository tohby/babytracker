<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use JsonException;

class EventPayload implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        if (($value !== [] && array_is_list($value)) || count($value) > 64) {
            $fail('invalid_event_payload');

            return;
        }

        try {
            if (strlen(json_encode($value, JSON_THROW_ON_ERROR)) > 16384) {
                $fail('invalid_event_payload');
            }
        } catch (JsonException) {
            $fail('invalid_event_payload');
        }
    }
}
