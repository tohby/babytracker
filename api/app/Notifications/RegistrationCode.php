<?php

namespace App\Notifications;

use App\Models\PendingRegistration;
use App\Models\User;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationCode extends Notification
{
    public function __construct(
        public readonly string $code,
        private readonly bool $signingIn = false,
        private readonly int $minutes = PendingRegistration::CODE_TTL_MINUTES,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(AnonymousNotifiable|User $notifiable): MailMessage
    {
        $copy = $this->signingIn ? 'notifications.sign_in_code' : 'notifications.registration_code';

        return (new MailMessage)
            ->subject(__("{$copy}.subject"))
            ->view(['mail.registration-code', 'mail.text.registration-code'], [
                'code' => $this->code,
                'minutes' => $this->minutes,
                'email' => $notifiable->routeNotificationFor('mail', $this),
                'copy' => $copy,
                'reason' => $this->signingIn ? 'account' : 'signup',
            ]);
    }
}
