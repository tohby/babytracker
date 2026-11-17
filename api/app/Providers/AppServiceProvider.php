<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
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
}
