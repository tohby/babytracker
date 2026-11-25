<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * New password plus proof it's the owner: the current password, or an email code from
 * `me/password-code` (forgotten password, or an account that has never had one).
 */
class UpdatePasswordRequest extends FormRequest
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
            'current_password' => ['nullable', 'required_without:code', 'string', 'max:255'],
            'code' => ['nullable', 'required_without:current_password', 'string', 'digits:6'],
            'password' => ['required', 'string', 'max:255', 'confirmed', Password::defaults()],
        ];
    }
}
