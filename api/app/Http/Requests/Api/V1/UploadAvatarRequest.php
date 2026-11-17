<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * JPEG, PNG or WebP up to 8 MB and 4096 px. The app should resize photos before upload
 * (expo-image-manipulator) and convert HEIC to JPEG.
 */
class UploadAvatarRequest extends FormRequest
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
            'avatar' => ['bail', 'required', 'file', 'mimes:jpeg,png,webp', 'max:8192', 'dimensions:min_width=64,min_height=64,max_width=4096,max_height=4096'],
        ];
    }
}
