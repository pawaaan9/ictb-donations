import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the base URL for redirects (same logic as payment session)
  const getBaseUrl = () => {
    // First try the environment variable
    if (process.env.NEXT_PUBLIC_DOMAIN) {
      return {
        url: process.env.NEXT_PUBLIC_DOMAIN,
        source: 'environment variable'
      };
    }
    
    // Fall back to request headers
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                    request.headers.get('x-forwarded-protocol') || 
                    (host?.includes('localhost') ? 'http' : 'https');
    
    if (host) {
      return {
        url: `${protocol}://${host}`,
        source: 'request headers'
      };
    }
    
    // Final fallback
    return {
      url: 'http://localhost:3000',
      source: 'fallback'
    };
  };

  const baseUrlInfo = getBaseUrl();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: baseUrlInfo,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-protocol': request.headers.get('x-forwarded-protocol'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
    },
    environmentVariables: {
      NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || 'not set',
    },
    generatedUrls: {
      success: `${baseUrlInfo.url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel: `${baseUrlInfo.url}`,
    }
  });
}
