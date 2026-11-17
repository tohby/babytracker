<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Baby;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBabyRequest extends FormRequest
{
    /**
     * Authorization is handled by BabyPolicy in the controller.
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
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'birth_date' => ['sometimes', 'required', 'date_format:Y-m-d', 'after_or_equal:-6 years', 'before_or_equal:+30 days'],
            'timezone' => ['sometimes', 'required', 'string', 'timezone:all'],
            'feeding_method' => ['sometimes', 'nullable', 'string', Rule::in(Baby::FEEDING_METHODS)],
            // Local time in the baby's zone, e.g. "06:30".
            'usual_wake_time' => ['sometimes', 'nullable', 'date_format:H:i'],
        ];
    }
}
