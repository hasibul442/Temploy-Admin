// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = new URL(request.url);

  const publicRoutes = ['/auth/login', '/auth/register'];

  const isPublicRoute = publicRoutes.includes(pathname);
  if (isPublicRoute === false && token == "undefined" || !token) {
    console.log('Redirecting to login - no token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isPublicRoute === true) {
    console.log('Redirecting to home - already authenticated');
    return NextResponse.redirect(new URL('/', request.url));
  }

}

export const config = {
  matcher: [
    '/',
    '/categories',
    '/auth/login',
    '/auth/register',
  ],
};
