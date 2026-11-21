<?php

namespace App\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class Passwords
{
    private static ?string $dummyHash = null;

    /**
     * Check a password in constant-ish time: when there's no user (or no password), a dummy hash is
     * still checked, so response times don't reveal which emails have accounts.
     */
    public static function check(?User $user, string $password): bool
    {
        if (! $user || $user->password === null) {
            Hash::check($password, self::$dummyHash ??= Hash::make(bin2hex(random_bytes(16))));

            return false;
        }

        return Hash::check($password, $user->password);
    }
}
