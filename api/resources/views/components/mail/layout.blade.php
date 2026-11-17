{{--
    Nappa email layout: Figma › Emails › "A · Mascot card".
    Lavender page (bg/gradient-bottom) › Email/Header › cream card (bg/gradient-top) with the
    mascot on top › Email/Footer. Tables and inline styles so it holds up in Gmail and Outlook.

    Tokens: text/primary #3E2A47, text/secondary #7A6A82, lavender/100 #EEE7F8,
    bg/gradient-top #FBF6F2, accent/primary #F28A3C. Spacing follows the Nappa scale
    (sm 8, lg 16, xl 24, 2xl 32).
--}}
@props([
    'title',
    'preview' => null,
    'mascot' => 'waving',
    'email' => null,
    'reason' => 'account',
])
@php
    // Mascot cutouts are 280px wide (2x). Heights keep each pose's aspect in the 140 × 158 slot.
    $mascotHeights = ['waving' => 137, 'thinking' => 148, 'awake' => 149];
    $mascotHeight = $mascotHeights[$mascot] ?? 140;
    $font = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    $links = array_filter([
        config('nappa.emails.privacy_url') ? ['label' => __('notifications.footer.privacy'), 'url' => config('nappa.emails.privacy_url')] : null,
        config('nappa.emails.help_url') ? ['label' => __('notifications.footer.help'), 'url' => config('nappa.emails.help_url')] : null,
        config('nappa.emails.contact_email') ? ['label' => __('notifications.footer.contact'), 'url' => 'mailto:'.config('nappa.emails.contact_email')] : null,
    ]);
    $address = config('nappa.emails.company_address');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    {{-- Designed for light only; asks clients not to auto-invert the colours. --}}
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $title }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root { color-scheme: light; supported-color-schemes: light; }
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
        a { color: #3E2A47; }
        @media (max-width: 480px) {
            .page { padding: 24px 12px !important; }
            .card { padding: 24px 16px !important; }
            .code { font-size: 36px !important; letter-spacing: 4px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#EEE7F8;">
@if ($preview)
    {{-- Inbox preview line. The trailing spacers stop clients pulling body text into it. --}}
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">{{ $preview }}{!! str_repeat('&#847;&zwnj;&nbsp;', 40) !!}</div>
@endif
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEE7F8;">
    <tr>
        <td align="center" class="page" style="padding:32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:552px;">
                {{-- Email/Header --}}
                <tr>
                    <td align="center" style="padding-bottom:24px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="padding-right:8px; vertical-align:middle;">
                                    <img src="{{ asset('images/email/app-icon.png') }}" width="40" height="40" alt="" style="display:block; border:0; border-radius:10px;">
                                </td>
                                <td style="vertical-align:middle; font-family:{{ $font }}; font-size:20px; font-weight:600; line-height:1.25; color:#3E2A47;">Nappa</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Card --}}
                <tr>
                    <td class="card" align="center" style="background-color:#FBF6F2; border-radius:24px; padding:32px 24px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" height="158" style="height:158px; padding-bottom:24px; vertical-align:middle;">
                                    <img src="{{ asset('images/email/mascot-'.$mascot.'.png') }}" width="140" height="{{ $mascotHeight }}" alt="" style="display:block; border:0; width:140px; height:{{ $mascotHeight }}px;">
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="font-family:{{ $font }}; color:#3E2A47; text-align:center;">
                                    <h1 style="margin:0 0 8px; font-family:{{ $font }}; font-size:28px; font-weight:600; line-height:1.2; letter-spacing:-0.56px; color:#3E2A47;">{{ $title }}</h1>
                                    {{ $slot }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Email/Footer --}}
                <tr>
                    <td align="center" style="padding:24px; font-family:{{ $font }}; font-weight:500; line-height:1.3; color:#3E2A47; text-align:center;">
                        <p style="margin:0 0 8px; font-size:14px;">{{ __('notifications.footer.tagline') }}</p>
                        @if ($email)
                            <p style="margin:0 0 8px; font-size:12px;">{{ __('notifications.footer.reason_'.$reason, ['email' => $email]) }}</p>
                        @endif
                        @if ($links)
                            <p style="margin:0 0 8px; font-size:12px;">
                                @foreach ($links as $link)
                                    <a href="{{ $link['url'] }}" style="color:#3E2A47; text-decoration:underline;">{{ $link['label'] }}</a>@if (! $loop->last)&nbsp;&nbsp;·&nbsp;&nbsp;@endif
                                @endforeach
                            </p>
                        @endif
                        <p style="margin:0; font-size:12px;">
                            {{ $address
                                ? __('notifications.footer.copyright_address', ['year' => now()->year, 'address' => $address])
                                : __('notifications.footer.copyright', ['year' => now()->year]) }}
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
