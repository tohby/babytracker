<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Baby;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBabyRequest extends FormRequest
{
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
            'name' => ['required', 'string', 'max:100'],
            // Allows a due date a little ahead (parents set up before the birth) and up to 6 years back.
            'birth_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:-6 years', 'before_or_equal:+30 days'],
            'timezone' => ['required', 'string', 'timezone:all'],
            'feeding_method' => ['nullable', 'string', Rule::in(Baby::FEEDING_METHODS)],
            // Local time in the baby's zone, e.g. "06:30".
            'usual_wake_time' => ['nullable', 'date_format:H:i'],
        ];
    }
}
