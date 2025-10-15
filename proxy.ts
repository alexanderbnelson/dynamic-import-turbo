import { NextRequest, NextResponse } from 'next/server';

// Configure your main domain here
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'localhost:3000';

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const path = url.pathname;

  // Skip proxy for static files, api routes, and Next.js internals
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') || // static files
    path.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Extract domain from hostname
  // Remove port number if present
  const domain = hostname.split(':')[0];
  const isMainDomain = hostname === MAIN_DOMAIN || hostname === 'localhost:3000';

  console.log(`[Proxy] Processing request:`, {
    hostname,
    domain,
    path,
    isMainDomain,
    MAIN_DOMAIN
  });

  // If this is not the main domain, rewrite to /[domain]/* routes
  if (!isMainDomain && !path.startsWith(`/${domain}`)) {
    // Rewrite subdomain.example.com/* to /[domain]/*
    // This allows different domains to be handled by the [domain] dynamic route
    const rewritePath = `/${domain}${path}`;
    console.log(`[Proxy] Rewriting ${hostname}${path} to ${rewritePath}`);

    url.pathname = rewritePath;
    return NextResponse.rewrite(url);
  }

  // For the main domain, handle special routes
  if (isMainDomain) {
    // Redirect root to /home for main domain
    if (path === '/') {
      url.pathname = '/home';
      console.log(`[Proxy] Redirecting main domain root to /home`);
      return NextResponse.rewrite(url);
    }

    // Allow /app/* routes for authenticated sections on main domain
    if (path.startsWith('/app')) {
      console.log(`[Proxy] Allowing /app route on main domain`);
      return NextResponse.next();
    }

    // Allow /home/* routes for marketing site on main domain
    if (path.startsWith('/home')) {
      console.log(`[Proxy] Allowing /home route on main domain`);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};