<?php

return [
    // Bump when the privacy policy changes; stored with each user's health-data consent.
    'privacy_policy_version' => env('NAPPA_PRIVACY_POLICY_VERSION', '2026-11'),

    'tokens' => [
        'access_minutes' => 30,
        'refresh_idle_days' => 60,
        'refresh_max_days' => 365,
        // A refresh token presented again within this window is treated as a client retry, not theft.
        'refresh_reuse_grace_seconds' => 10,
    ],

    // Onboarding chapters, Figma "Onboarding screen" page (219:6117).
    'onboarding_steps' => [
        'meet_nappa',
        'baby_basics',
        'routine_reminders',
        'sleep',
        'growth_care',
        'building_plan',
        'paywall',
    ],

    'avatar' => [
        'size' => 512,
        'max_kb' => 8192,
        'url_minutes' => 60 * 24,
    ],

    // Links and details in emails. Footer links and the address are left out until set.
    'emails' => [
        // Where "Sign in to Nappa" buttons go. Swap for a universal link / store page once the app ships.
        'sign_in_url' => env('NAPPA_SIGN_IN_URL'),
        'privacy_url' => env('NAPPA_PRIVACY_URL'),
        'help_url' => env('NAPPA_HELP_URL'),
        'contact_email' => env('NAPPA_CONTACT_EMAIL'),
        'company_address' => env('NAPPA_COMPANY_ADDRESS'),
    ],
];
