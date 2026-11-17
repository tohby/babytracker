<?php

namespace App\Http\Api;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * An expected API failure with a machine-readable code, e.g. `invalid_credentials` (401).
 * Laravel calls render() itself, so throwing one anywhere in a request returns this JSON.
 */
class ApiException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $extra  Additional fields, e.g. ['retry_after' => 60].
     * @param  array<string, string>  $headers
     */
    public function __construct(
        public readonly string $errorCode,
        public readonly int $status,
        public readonly array $extra = [],
        public readonly array $headers = [],
    ) {
        parent::__construct($errorCode);
    }

    public function render(): JsonResponse
    {
        return response()->json(['code' => $this->errorCode, ...$this->extra], $this->status, $this->headers);
    }
}
