/** @format */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
// This function can be marked `async` if using `await` inside

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await auth();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  if (user?.id && (pathname === '/siginin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!user?.id && pathname === '/checkout') {
    const loginUrl = new URL('/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Set the redirect parameter
    return NextResponse.redirect(loginUrl);
  }

  // if (user?.id && pathname === '/add-address') {
  //   const loginUrl = new URL('/signin', request.url);
  //   loginUrl.searchParams.set('redirect', pathname); // Set the redirect parameter
  //   return NextResponse.redirect(loginUrl);
  // }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/register', '/checkout'],
};
