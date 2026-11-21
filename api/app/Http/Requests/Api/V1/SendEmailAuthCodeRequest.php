<?php

namespace App\Http\Requests\Api\V1;

use App\Models\EmailAuthCode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class SendEmailAuthCodeRequest extends EmailRequest
{
    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'intent' => ['required', 'string', Rule::in([EmailAuthCode::SIGN_IN, EmailAuthCode::CREATE_ACCOUNT])],
            'locale' => ['nullable', 'string', 'max:35', 'regex:/^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})*$/'],
            'consent' => ['accepted_if:intent,'.EmailAuthCode::CREATE_ACCOUNT],
        ];
    }
}
