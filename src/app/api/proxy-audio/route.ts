import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.statusText}` }, { status: response.status });
    }

    // Set appropriate headers for audio streaming
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Accept-Ranges', 'bytes');
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    // Return the stream
    return new NextResponse(response.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error('Audio proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
