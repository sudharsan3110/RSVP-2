import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/ticket',
  '/profile',
  '/create-event',
  '/events',
  '/scanner',
  '/user',
  '/planned',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const { pathname } = request.nextUrl;
  console.log(pathname);

  if (pathname === '/' && token) {
    const url = new URL('/events', request.url);
    return NextResponse.redirect(url);
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    console.log('redirecting to login');
    console.log(token, 'token');
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
    '/user/:path*',
    '/planned/:path*',
    '/',
  ],
};
