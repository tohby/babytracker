{{-- "Button not working?" fallback with the raw URL (Nappa/Caption). --}}
@props(['url'])
<p style="margin:16px 0 0; font-family:'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; font-weight:500; line-height:1.3; color:#7A6A82; word-break:break-all;">{{ __('notifications.link_fallback') }} <a href="{{ $url }}" style="color:#7A6A82; text-decoration:underline;">{{ $url }}</a></p>
