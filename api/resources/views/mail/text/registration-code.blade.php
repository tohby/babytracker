{!! __('notifications.registration_code.title') !!}

{!! __('notifications.registration_code.intro') !!}

{!! $code !!}
{!! trans_choice('notifications.registration_code.expiry', $minutes, ['minutes' => $minutes]) !!}

{!! __('notifications.registration_code.ignore') !!}

--
{!! __('notifications.footer.reason_signup', ['email' => $email]) !!}
