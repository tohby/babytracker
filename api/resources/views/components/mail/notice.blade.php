{{-- Email/Notice: info = lavender/100, security = orange/100, success = mint/100; text/primary on all. --}}
@props(['title', 'type' => 'info'])
@php($bg = ['info' => '#EEE7F8', 'security' => '#FDE6D3', 'success' => '#DDF2E8'][$type] ?? '#EEE7F8')
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
    <tr>
        <td style="background-color:{{ $bg }}; border-radius:16px; padding:16px; font-family:'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:1.3; color:#3E2A47; text-align:center;">
            <div style="font-weight:600;">{{ $title }}</div>
            <div style="margin-top:4px; font-weight:500;">{{ $slot }}</div>
        </td>
    </tr>
</table>
