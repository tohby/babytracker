<?php

namespace App\Http\Requests\Api\V1;

use App\Rules\HardToGuessPin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/** Set or change this phone's PIN from Settings. Needs the password, because a PIN is a new way in. */
class SetPinRequest extends FormRequest
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
            'password' => ['required', 'string', 'max:255'],
            'pin' => ['bail', 'required', 'string', 'digits:6', new HardToGuessPin],
        ];
    }
}
