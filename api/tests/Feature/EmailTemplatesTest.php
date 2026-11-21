<?php

use App\Models\User;
use App\Notifications\AccountAlreadyExists;
use App\Notifications\AccountDeletionCode;
use App\Notifications\RegistrationCode;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;

function renderMail(MailMessage $mail): array
{
    return [
        'html' => view($mail->view[0], $mail->viewData)->render(),
        'text' => view($mail->view[1], $mail->viewData)->render(),
    ];
}

test('the sign-up code email shows the code as six copyable digits, with a text version', function () {
    $mail = (new RegistrationCode('482913'))->toMail((new AnonymousNotifiable)->route('mail', 'kemi@example.com'));
    ['html' => $html, 'text' => $text] = renderMail($mail);

    expect($mail->subject)->toBe('Your Nappa sign-up code')
        ->and($html)->toContain('<span>482</span><span style="padding-left:12px;">913</span>')
        ->toContain('Expires in 15 minutes')
        ->toContain('mascot-waving.png')
        ->toContain('kemi@example.com was used to sign up for Nappa')
        ->and($text)->toContain('482913')->not->toContain('<');
});

test('the account-exists email links to sign in', function () {
    config(['nappa.emails.sign_in_url' => 'https://nappa.example/sign-in']);
    $mail = (new AccountAlreadyExists)->toMail((new AnonymousNotifiable)->route('mail', 'kemi@example.com'));
    ['html' => $html] = renderMail($mail);

    expect($mail->subject)->toBe('You already have a Nappa account')
        ->and($html)->toContain('href="https://nappa.example/sign-in"')->toContain('Sign in to Nappa');
});

test('the sign-in email has a copyable code and the correct expiry', function () {
    $mail = (new RegistrationCode('482913', signingIn: true, minutes: 10))
        ->toMail((new AnonymousNotifiable)->route('mail', 'kemi@example.com'));
    ['html' => $html, 'text' => $text] = renderMail($mail);

    expect($mail->subject)->toBe('Your Nappa sign-in code')
        ->and($html)->toContain('Expires in 10 minutes')->toContain('sign in to your account')
        ->and($text)->toContain('482913')->toContain('Expires in 10 minutes');
});

test('an account deletion email identifies the destructive action in both versions', function () {
    $mail = (new AccountDeletionCode('482913'))->toMail((new AnonymousNotifiable)->route('mail', 'kemi@example.com'));
    ['html' => $html, 'text' => $text] = renderMail($mail);

    expect($mail->subject)->toBe('Your Nappa account deletion code')
        ->and($html)->toContain('permanently delete your account')->toContain('Expires in 10 minutes')
        ->and($text)->toContain('permanently delete your account')->toContain('482913');
});

test('the reset email uses the Nappa design and a working reset link', function () {
    $user = User::factory()->make(['email' => 'kemi@example.com']);
    $mail = (new ResetPassword('token123'))->toMail($user);
    ['html' => $html, 'text' => $text] = renderMail($mail);

    $url = url(route('password.reset', ['token' => 'token123', 'email' => 'kemi@example.com'], false));
    expect($mail->subject)->toBe('Reset your Nappa password')
        ->and($html)->toContain(e($url))->toContain('The link works for 60 minutes')->toContain('Good to know')
        ->and($text)->toContain($url);
});

test('the verify email keeps the signed link intact in the text version', function () {
    $user = User::factory()->make(['email' => 'kemi@example.com']);
    $url = 'https://nappa.example/email/verify/1/abc?expires=1&signature=xyz';
    $mail = call_user_func(VerifyEmail::$toMailCallback, $user, $url);
    ['html' => $html, 'text' => $text] = renderMail($mail);

    expect($mail->subject)->toBe('Confirm your Nappa email')
        ->and($html)->toContain(e($url))
        ->and($text)->toContain($url);
});

test('footer links and address appear only when configured', function () {
    $to = (new AnonymousNotifiable)->route('mail', 'kemi@example.com');

    expect(renderMail((new AccountAlreadyExists)->toMail($to))['html'])->not->toContain('Privacy');

    config(['nappa.emails.privacy_url' => 'https://nappa.example/privacy', 'nappa.emails.company_address' => '1 Panda Lane']);

    expect(renderMail((new AccountAlreadyExists)->toMail($to))['html'])
        ->toContain('href="https://nappa.example/privacy"')->toContain('1 Panda Lane');
});
