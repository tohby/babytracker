<?php

namespace App\Http\Api;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Error responses for /api/*: machine-readable codes, never display sentences.
 * The app turns codes into translated text, so the API stays language-neutral.
 *
 *   { "code": "validation_failed", "errors": { "email": ["unique"] } }
 *   { "code": "unauthenticated" }
 */
class ApiErrors
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->render(function (Throwable $e, Request $request): ?JsonResponse {
            if (! $request->is('api/*')) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => response()->json([
                    'code' => 'validation_failed',
                    'errors' => self::validationCodes($e),
                ], $e->status),
                $e instanceof AuthenticationException => response()->json(['code' => 'unauthenticated'], 401),
                // Policies can deny as 404 (denyAsNotFound) so ids can't be probed.
                $e instanceof AuthorizationException => response()->json(
                    ['code' => self::httpCode($e->status() ?? 403)],
                    $e->status() ?? 403,
                ),
                $e instanceof ModelNotFoundException => response()->json(['code' => 'not_found'], 404),
                $e instanceof HttpExceptionInterface => response()->json(
                    ['code' => self::httpCode($e->getStatusCode())],
                    $e->getStatusCode(),
                    $e->getHeaders(),
                ),
                default => null, // Unexpected errors keep Laravel's handling (and debug output locally).
            };
        });
    }

    /**
     * Failed rules per field as snake_case codes, e.g. `required`, `unique`, `date_format`, `password`.
     *
     * @return array<string, list<string>>
     */
    private static function validationCodes(ValidationException $e): array
    {
        $codes = [];
        foreach ($e->validator->failed() as $field => $rules) {
            $codes[$field] = array_map(
                fn (string $rule): string => Str::snake(class_basename($rule)),
                array_keys($rules),
            );
        }

        return $codes;
    }

    private static function httpCode(int $status): string
    {
        return match ($status) {
            401 => 'unauthenticated',
            403 => 'forbidden',
            404 => 'not_found',
            405 => 'method_not_allowed',
            429 => 'too_many_requests',
            503 => 'unavailable',
            default => 'http_'.$status,
        };
    }
}
