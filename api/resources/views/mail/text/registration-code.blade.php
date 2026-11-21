{!! __("{$copy}.title") !!}

{!! __("{$copy}.intro") !!}

{!! $code !!}
{!! trans_choice('notifications.registration_code.expiry', $minutes, ['minutes' => $minutes]) !!}

{!! __("{$copy}.ignore") !!}

--
{!! __("notifications.footer.reason_{$reason}", ['email' => $email]) !!}
