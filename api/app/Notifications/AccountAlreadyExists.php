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
            ->greeting(__('notifications.account_exists.greeting'))
            ->line(__('notifications.account_exists.intro'))
            ->line(__('notifications.account_exists.action'))
            ->line(__('notifications.account_exists.ignore'));
    }
}
