<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Email + password. A phone that is already remembered sends its device id and secret so the same
 * device (and its PIN) is reused instead of a new one being created.
 */
class LoginRequest extends FormRequest
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
            'password' => ['required', 'string', 'max:255'],
            'platform' => ['nullable', 'string', 'in:ios,android'],
            'device_id' => ['nullable', 'string', 'size:26'],
            'device_secret' => ['nullable', 'string', 'max:100'],
        ];
    }
}
