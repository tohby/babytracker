{{--
    Email/Code: the 6-digit code on lavender/100. Real text so it can be copied and read aloud.
    The gap between the halves is padding, not a space, so a copied code pastes as six digits.
--}}
@props(['code', 'expiry'])
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
    <tr>
        <td align="center" style="background-color:#EEE7F8; border-radius:16px; padding:16px 24px; font-family:'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#3E2A47; text-align:center;">
            <div class="code" style="font-size:44px; font-weight:300; line-height:1; letter-spacing:6px; white-space:nowrap;"><span>{{ substr($code, 0, 3) }}</span><span style="padding-left:12px;">{{ substr($code, 3) }}</span></div>
            <div style="margin-top:4px; font-size:12px; font-weight:500; line-height:1.3;">{{ $expiry }}</div>
        </td>
    </tr>
</table>
