// proxy.js
import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = new URL(request.url);

  const publicRoutes = ['/auth/login', '/auth/register'];

  const isPublicRoute = publicRoutes.includes(pathname);
  if (isPublicRoute == false && (token == "undefined" || !token)) {
    console.log('Redirecting to login - no token');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isPublicRoute === true) {
    console.log('Redirecting to home - already authenticated');
    return NextResponse.redirect(new URL('/', request.url));
  }

}

// Every page is private except publicRoutes above. Next's build files and static assets are skipped
// so they still load on the login page.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpe?g|gif|webp|ico|woff2?|mp4)$).*)',
  ],
};
