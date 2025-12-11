import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get('auth_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Protected paths (everything except login, api, and static files)
  const isProtectedPath = !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.includes('.');

  // If trying to access protected page without session, redirect to login
  if (isProtectedPath && !authSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page WITH session, redirect to dashboard
  if (isLoginPage && authSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
