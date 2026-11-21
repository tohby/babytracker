<?php

namespace App\Http\Requests\Api\V1;

use App\Models\EmailAuthCode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class VerifyEmailAuthCodeRequest extends VerifyRegistrationRequest
{
    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'intent' => ['required', 'string', Rule::in([EmailAuthCode::SIGN_IN, EmailAuthCode::CREATE_ACCOUNT])],
            'device_id' => ['nullable', 'string', 'size:26'],
            'device_secret' => ['nullable', 'string', 'max:100'],
        ];
    }
}
