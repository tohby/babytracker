<x-mail.layout :title="__($copy.'.title')" :preview="__($copy.'.preview', ['code' => $code])" mascot="waving" :email="$email" :reason="$reason">
    <x-mail.intro>{{ __("{$copy}.intro") }}</x-mail.intro>
    <x-mail.code :code="$code" :expiry="trans_choice('notifications.registration_code.expiry', $minutes, ['minutes' => $minutes])" />
    <x-mail.note>{{ __("{$copy}.ignore") }}</x-mail.note>
</x-mail.layout>
