<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Start sign-up. No `unique` rule on email: the response must not reveal whether an account exists.
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            // bcrypt ignores anything past 72 bytes, so cap it. No confirmation field: the app has a reveal toggle.
            'password' => ['required', 'string', 'max:64', Password::default()],
            'locale' => ['nullable', 'string', 'max:35', 'regex:/^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$/'],
            // Explicit consent to storing baby health data (GDPR special category).
            'consent' => ['accepted'],
        ];
    }
}
