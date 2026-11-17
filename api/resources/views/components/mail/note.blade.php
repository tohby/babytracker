{{-- Secondary line in the card (Nappa/Label, or Nappa/Caption with size="12"). --}}
@props(['size' => 14])
<p style="margin:16px 0 0; font-family:'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:{{ $size }}px; font-weight:500; line-height:1.3; color:#7A6A82; word-break:break-word;">{{ $slot }}</p>
