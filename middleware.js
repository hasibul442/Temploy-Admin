// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const url = request.nextUrl.clone();

  // Check user token validity
    if (!token) {
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }
}

export const config = {
  matcher: [
    '/',
  ],
};
