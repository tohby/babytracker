<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent instead of a code when someone signs up with an email that already has an account.
 * The API answers both cases the same way, so the sign-up form can't be used to test emails.
 */
class AccountAlreadyExists extends Notification
{
    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('notifications.account_exists.subject'))
            ->view(['mail.account-exists', 'mail.text.account-exists'], [
                'signInUrl' => config('nappa.emails.sign_in_url') ?: route('login'),
                'email' => $notifiable->routeNotificationFor('mail', $this),
            ]);
    }
}
