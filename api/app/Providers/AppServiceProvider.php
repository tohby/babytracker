<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimits();
        $this->configureAuthEmails();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Request limits for the app's auth endpoints. These cap volume (per email, IP or user);
     * the escalating pause after wrong passwords is SignInThrottle.
     */
    protected function configureRateLimits(): void
    {
        $email = fn (Request $request): string => 'email:'.mb_strtolower(trim((string) $request->input('email')));

        RateLimiter::for('api-auth', fn (Request $request): array => [
            Limit::perMinute(10)->by($email($request).'|'.$request->ip()),
            Limit::perMinute(30)->by('ip:'.$request->ip()),
        ]);

        RateLimiter::for('auth-register', fn (Request $request): array => [
            Limit::perHour(5)->by('register|'.$email($request)),
            Limit::perHour(20)->by('register|ip:'.$request->ip()),
        ]);

        // Resend code and forgot password: each sends an email.
        RateLimiter::for('auth-email', fn (Request $request): array => [
            Limit::perMinute(1)->by($request->route()?->getName().'|'.$email($request)),
            Limit::perHour(5)->by($request->route()?->getName().'|hour|'.$email($request)),
            Limit::perHour(20)->by($request->route()?->getName().'|ip:'.$request->ip()),
        ]);

        RateLimiter::for('auth-refresh', fn (Request $request): Limit => Limit::perMinute(60)->by('refresh|ip:'.$request->ip()));

        // Delete account, sign out everywhere, set PIN, upload avatar.
        RateLimiter::for('auth-sensitive', fn (Request $request): Limit => Limit::perMinute(5)->by('sensitive|user:'.$request->user()?->id));
    }

    /**
     * Laravel's built-in reset-password and verify-email notifications, in the Nappa email design
     * (resources/views/mail). Links and expiry are the same as Laravel's defaults.
     */
    protected function configureAuthEmails(): void
    {
        ResetPassword::toMailUsing(function (object $notifiable, string $token): MailMessage {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject(__('notifications.reset_password.subject'))
                ->view(['mail.reset-password', 'mail.text.reset-password'], [
                    'url' => $url,
                    'minutes' => (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
                    'email' => $notifiable->getEmailForPasswordReset(),
                ]);
        });

        VerifyEmail::toMailUsing(fn (object $notifiable, string $url): MailMessage => (new MailMessage)
            ->subject(__('notifications.verify_email.subject'))
            ->view(['mail.verify-email', 'mail.text.verify-email'], [
                'url' => $url,
                'minutes' => (int) config('auth.verification.expire', 60),
                'email' => $notifiable->getEmailForVerification(),
            ]));
    }
}
