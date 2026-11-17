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
            ->greeting(__('notifications.registration_code.greeting'))
            ->line(__('notifications.registration_code.intro'))
            ->line('**'.$this->code.'**')
            ->line(__('notifications.registration_code.expiry', ['minutes' => PendingRegistration::CODE_TTL_MINUTES]))
            ->line(__('notifications.registration_code.ignore'));
    }
}
