<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/** Remembered phone with a PIN: device id + secret + PIN. */
class PinLoginRequest extends FormRequest
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
            'device_id' => ['required', 'string', 'size:26'],
            'device_secret' => ['required', 'string', 'max:100'],
            'pin' => ['required', 'string', 'digits:6'],
        ];
    }
}
