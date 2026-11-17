<x-mail.layout :title="__('notifications.account_exists.title')" :preview="__('notifications.account_exists.preview')" mascot="thinking" :email="$email">
    <x-mail.intro>{{ __('notifications.account_exists.intro') }}</x-mail.intro>
    <x-mail.button :url="$signInUrl">{{ __('notifications.account_exists.action') }}</x-mail.button>
    <x-mail.note>{{ __('notifications.account_exists.forgot') }}</x-mail.note>
    <x-mail.note>{{ __('notifications.account_exists.ignore') }}</x-mail.note>
</x-mail.layout>
