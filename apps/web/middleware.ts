import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/ticket', '/profile', '/events', '/scanner', '/planned'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;

  if (pathname === '/' && token) {
    const url = new URL('/events', request.url);
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ticket/:path*',
    '/profile/:path*',
    '/create-event/:path*',
    '/events/:path*',
    '/scanner/:path*',
    '/planned/:path*',
    '/',
  ],
};
