<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/** "What should I call you?" (optional) and language. */
class UpdateProfileRequest extends FormRequest
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
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'locale' => ['nullable', 'string', 'max:35', 'regex:/^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$/'],
        ];
    }
}
