<x-mail.layout :title="__('notifications.registration_code.title')" :preview="__('notifications.registration_code.preview', ['code' => $code])" mascot="waving" :email="$email" reason="signup">
    <x-mail.intro>{{ __('notifications.registration_code.intro') }}</x-mail.intro>
    <x-mail.code :code="$code" :expiry="trans_choice('notifications.registration_code.expiry', $minutes, ['minutes' => $minutes])" />
    <x-mail.note>{{ __('notifications.registration_code.ignore') }}</x-mail.note>
</x-mail.layout>
