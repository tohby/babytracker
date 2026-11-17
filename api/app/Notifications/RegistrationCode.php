<?php

namespace App\Notifications;

use App\Models\PendingRegistration;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationCode extends Notification
{
    public function __construct(public readonly string $code) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('notifications.registration_code.subject'))
            ->view(['mail.registration-code', 'mail.text.registration-code'], [
                'code' => $this->code,
                'minutes' => PendingRegistration::CODE_TTL_MINUTES,
                'email' => $notifiable->routeNotificationFor('mail', $this),
            ]);
    }
}
