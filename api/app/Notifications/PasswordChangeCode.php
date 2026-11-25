<?php

namespace App\Notifications;

use App\Models\EmailAuthCode;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Settings › Security & Sign-In: proves it's the account owner before a password is set or replaced. */
class PasswordChangeCode extends Notification
{
    public function __construct(public readonly string $code) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(AnonymousNotifiable $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('notifications.password_change_code.subject'))
            ->view(['mail.registration-code', 'mail.text.registration-code'], [
                'code' => $this->code,
                'minutes' => EmailAuthCode::CODE_TTL_MINUTES,
                'email' => $notifiable->routeNotificationFor('mail'),
                'copy' => 'notifications.password_change_code',
                'reason' => 'account',
            ]);
    }
}
