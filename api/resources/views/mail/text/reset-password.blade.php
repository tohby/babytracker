{!! __('notifications.reset_password.title') !!}

{!! trans_choice('notifications.reset_password.intro', $minutes, ['minutes' => $minutes]) !!}

{!! __('notifications.reset_password.action') !!}: {!! $url !!}

{!! __('notifications.reset_password.notice_title') !!}: {!! __('notifications.reset_password.notice') !!}

{!! __('notifications.reset_password.ignore') !!}

--
{!! __('notifications.footer.reason_account', ['email' => $email]) !!}
