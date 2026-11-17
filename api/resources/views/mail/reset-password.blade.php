<x-mail.layout :title="__('notifications.reset_password.title')" :preview="trans_choice('notifications.reset_password.preview', $minutes, ['minutes' => $minutes])" mascot="awake" :email="$email">
    <x-mail.intro>{{ trans_choice('notifications.reset_password.intro', $minutes, ['minutes' => $minutes]) }}</x-mail.intro>
    <x-mail.button :url="$url">{{ __('notifications.reset_password.action') }}</x-mail.button>
    <x-mail.link :url="$url" />
    <x-mail.notice :title="__('notifications.reset_password.notice_title')">{{ __('notifications.reset_password.notice') }}</x-mail.notice>
    <x-mail.note>{{ __('notifications.reset_password.ignore') }}</x-mail.note>
</x-mail.layout>
