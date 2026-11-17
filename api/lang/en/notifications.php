<?php

// Email copy. Design: Figma "Nappa — Baby Tracker App" › Emails › "A · Mascot card"
// (layout) and "Account emails" (copy per email). `preview` is the inbox preview line.

return [
    'footer' => [
        'tagline' => 'Calmer days start with knowing what’s next',
        'reason_account' => 'You’re getting this email because it’s about your Nappa account (:email).',
        'reason_signup' => 'You’re getting this email because :email was used to sign up for Nappa.',
        'privacy' => 'Privacy',
        'help' => 'Help',
        'contact' => 'Contact us',
        'copyright' => '© :year Nappa',
        'copyright_address' => '© :year Nappa · :address',
    ],

    'link_fallback' => 'Button not working? Copy this link:',

    'registration_code' => [
        'subject' => 'Your Nappa sign-up code',
        'preview' => 'Enter :code to finish creating your account.',
        'title' => 'Here’s your code',
        'intro' => 'Enter it in Nappa to finish creating your account.',
        'expiry' => '{1} Expires in :minutes minute|[2,*] Expires in :minutes minutes',
        'ignore' => 'Didn’t try to sign up? You can ignore this email. No account is made without the code.',
    ],

    'account_exists' => [
        'subject' => 'You already have a Nappa account',
        'preview' => 'Someone tried to sign up with this email. You can sign in instead.',
        'title' => 'You already have an account',
        'intro' => 'Someone just tried to create a Nappa account with this email. You already have one, so nothing new was made.',
        'action' => 'Sign in to Nappa',
        'forgot' => 'Forgotten your password? Tap “Forgot password?” on the sign-in screen.',
        'ignore' => 'Wasn’t you? You can ignore this email. Your account hasn’t changed.',
    ],

    'reset_password' => [
        'subject' => 'Reset your Nappa password',
        'preview' => '{1} This link works for :minutes minute.|[2,*] This link works for :minutes minutes.',
        'title' => 'Reset your password',
        'intro' => '{1} Tap the button to choose a new password. The link works for :minutes minute.|[2,*] Tap the button to choose a new password. The link works for :minutes minutes.',
        'action' => 'Choose a new password',
        'notice_title' => 'Good to know',
        'notice' => 'Resetting signs you out on every phone. Sign in again with your new password.',
        'ignore' => 'Didn’t ask for this? You can ignore this email. Your password stays the same.',
    ],

    'verify_email' => [
        'subject' => 'Confirm your Nappa email',
        'preview' => 'One tap and your email is confirmed.',
        'title' => 'Confirm your email',
        'intro' => '{1} Tap the button to confirm this is your email address. The link works for :minutes minute.|[2,*] Tap the button to confirm this is your email address. The link works for :minutes minutes.',
        'action' => 'Confirm email',
        'ignore' => 'Didn’t create a Nappa account? You can ignore this email.',
    ],
];
