import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Check if current hostname is the admin subdomain (e.g. admin.kmlri.in or admin.localhost:3000)
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname.startsWith('admin-');

  if (isAdminSubdomain) {
    // If on admin subdomain and not already prefixed with /admin, rewrite internally to /admin
    if (!pathname.startsWith('/admin')) {
      const targetPath = pathname === '/' ? '/admin' : `/admin${pathname}`;
      return NextResponse.rewrite(new URL(targetPath, request.url));
    }
  }

  // Auto-redirect logged-in patrons trying to access /login or /signup
  if (pathname === '/login' || pathname === '/signup') {
    const token = request.cookies.get('kmlri_token')?.value;
    const slug = request.cookies.get('kmlri_slug')?.value;
    if (token) {
      const destination = slug ? `/${slug}` : '/account';
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (SVG and static icons)
     * - uploads (uploaded folios)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|assets|uploads|favicon.ico).*)',
  ],
};
