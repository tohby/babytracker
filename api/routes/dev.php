<?php

use App\Models\User;
use App\Notifications\AccountAlreadyExists;
use App\Notifications\RegistrationCode;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Route;

// Email previews, local only: /dev/mail lists them, /dev/mail/{name} renders one.
// Loaded from routes/web.php only when APP_ENV=local.

Route::get('dev/mail/{name?}', function (?string $name = null) {
    $email = 'kemi@example.com';
    $to = (new AnonymousNotifiable)->route('mail', $email);
    $user = new User(['email' => $email]);

    $mails = [
        'registration-code' => fn () => (new RegistrationCode('482913'))->toMail($to),
        'account-exists' => fn () => (new AccountAlreadyExists)->toMail($to),
        'reset-password' => fn () => (new ResetPassword(str_repeat('a1b2c3', 10)))->toMail($user),
        'verify-email' => fn () => VerifyEmail::$toMailCallback
            ? call_user_func(VerifyEmail::$toMailCallback, $user, url('/email/verify/1/hash?expires=1&signature=preview'))
            : abort(404),
    ];

    if ($name === null) {
        return collect($mails)->keys()
            ->map(fn (string $key) => "<li><a href=\"/dev/mail/{$key}\">{$key}</a></li>")
            ->prepend('<ul style="font-family:sans-serif">')->push('</ul>')->implode('');
    }

    abort_unless(isset($mails[$name]), 404);

    return $mails[$name]()->render();
})->name('dev.mail');
