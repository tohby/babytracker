<?php

namespace App\Notifications;

use App\Models\EmailAuthCode;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeletionCode extends Notification
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
            ->subject(__('notifications.account_deletion_code.subject'))
            ->view(['mail.registration-code', 'mail.text.registration-code'], [
                'code' => $this->code,
                'minutes' => EmailAuthCode::CODE_TTL_MINUTES,
                'email' => $notifiable->routeNotificationFor('mail'),
                'copy' => 'notifications.account_deletion_code',
                'reason' => 'account',
            ]);
    }
}
