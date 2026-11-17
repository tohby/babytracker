<?php

namespace App\Http\Requests\Api\V1;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules(),
            // No confirmation field: the app shows a reveal toggle instead of a second box.
            'password' => ['required', 'string', Password::default()],
            'device_name' => ['required', 'string', 'max:255'],
            'locale' => ['nullable', 'string', 'max:35', 'regex:/^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$/'],
        ];
    }
}
