<?php

namespace App\Listeners;

use App\Auth\DeviceSessions;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;

/**
 * A reset password signs out every phone and forgets every device, for both the API reset and the
 * Fortify web reset page. This is the "lost or stolen phone" fix.
 */
class RevokeDevicesAfterPasswordReset
{
    public function __construct(private readonly DeviceSessions $sessions) {}

    public function handle(PasswordReset $event): void
    {
        if ($event->user instanceof User) {
            $this->sessions->revokeAll($event->user);
        }
    }
}
