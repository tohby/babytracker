{{-- Email/Button: accent/primary pill with a text/on-accent-ink label (white on orange fails AA). One per email. --}}
@props(['url'])
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:16px auto 0;">
    <tr>
        <td align="center" bgcolor="#F28A3C" style="background-color:#F28A3C; border-radius:999px;">
            <a href="{{ $url }}" target="_blank" rel="noopener" style="display:inline-block; padding:16px 32px; font-family:'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:20px; font-weight:600; line-height:1.25; color:#3E2A47; text-decoration:none; border-radius:999px;">{{ $slot }}</a>
        </td>
    </tr>
</table>
