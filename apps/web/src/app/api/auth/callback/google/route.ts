import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This route exists so Google can redirect back to it.
  // The actual token is in the URL hash (#id_token=...) which the popup's parent window reads.
  // Return a simple HTML that closes itself or signals the parent.
  const html = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p>Authenticating... This window will close automatically.</p>
<script>
  // The parent window's interval will detect this page loaded and read the hash
  // If for some reason it doesn't, try to close after a delay
  setTimeout(() => { window.close(); }, 3000);
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
