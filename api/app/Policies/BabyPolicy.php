<?php

namespace App\Policies;

use App\Models\Baby;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BabyPolicy
{
    /**
     * Anyone linked to the baby can see it. Others get a 404, so ids can't be probed.
     */
    public function view(User $user, Baby $baby): Response
    {
        return $this->isMember($user, $baby) ? Response::allow() : Response::denyAsNotFound();
    }

    /**
     * Anyone linked to the baby can edit its profile.
     */
    public function update(User $user, Baby $baby): Response
    {
        return $this->view($user, $baby);
    }

    /**
     * Only the owner can delete a baby.
     */
    public function delete(User $user, Baby $baby): Response
    {
        if (! $this->isMember($user, $baby)) {
            return Response::denyAsNotFound();
        }

        return $this->role($user, $baby) === Baby::ROLE_OWNER ? Response::allow() : Response::deny();
    }

    private function isMember(User $user, Baby $baby): bool
    {
        return $this->role($user, $baby) !== null;
    }

    private function role(User $user, Baby $baby): ?string
    {
        /** @var string|null */
        return $baby->users()->whereKey($user->id)->value('baby_user.role');
    }
}
