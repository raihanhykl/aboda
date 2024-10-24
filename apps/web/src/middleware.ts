/** @format */
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await auth();
  const user = session?.user;
  const { pathname } = request.nextUrl;

  console.log(user, 'ini userrrrrr');
  if (session?.user.access_token) {
    console.log('masukkk refresh');
    // await signIn('credentials', {
    //   access_token: session.user.access_token,
    //   redirect: false,
    // });
  }

  if (user?.id && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    !user?.id &&
    (pathname === '/checkout' ||
      pathname === '/add-address' ||
      pathname === '/signin')
  ) {
    const loginUrl = new URL('/signin', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    console.log(request.url, 'ini request url');
    // Set the redirect parameter
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/login', '/register', '/checkout'],
};
