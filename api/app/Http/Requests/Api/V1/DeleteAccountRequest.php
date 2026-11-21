<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;

class DeleteAccountRequest extends ConfirmPasswordRequest
{
    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return $this->user()->password === null
            ? ['code' => ['required', 'string', 'digits:6']]
            : parent::rules();
    }
}
