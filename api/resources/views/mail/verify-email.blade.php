<x-mail.layout :title="__('notifications.verify_email.title')" :preview="__('notifications.verify_email.preview')" mascot="waving" :email="$email">
    <x-mail.intro>{{ trans_choice('notifications.verify_email.intro', $minutes, ['minutes' => $minutes]) }}</x-mail.intro>
    <x-mail.button :url="$url">{{ __('notifications.verify_email.action') }}</x-mail.button>
    <x-mail.link :url="$url" />
    <x-mail.note>{{ __('notifications.verify_email.ignore') }}</x-mail.note>
</x-mail.layout>
