{!! __('notifications.verify_email.title') !!}

{!! trans_choice('notifications.verify_email.intro', $minutes, ['minutes' => $minutes]) !!}

{!! __('notifications.verify_email.action') !!}: {!! $url !!}

{!! __('notifications.verify_email.ignore') !!}

--
{!! __('notifications.footer.reason_account', ['email' => $email]) !!}
