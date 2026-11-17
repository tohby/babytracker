<?php

return [
    'registration_code' => [
        'subject' => 'Your Nappa sign-up code',
        'greeting' => 'Welcome to Nappa',
        'intro' => 'Enter this code in the app to finish creating your account:',
        'expiry' => 'The code expires in :minutes minutes.',
        'ignore' => 'If you didn’t try to sign up, you can ignore this email.',
    ],
    'account_exists' => [
        'subject' => 'You already have a Nappa account',
        'greeting' => 'Welcome back',
        'intro' => 'Someone tried to create a Nappa account with this email, but you already have one.',
        'action' => 'Sign in from the app, or reset your password if you’ve forgotten it.',
        'ignore' => 'If this wasn’t you, you can ignore this email. Your account hasn’t changed.',
    ],
];
