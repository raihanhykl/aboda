'use client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  actionLogout,
  loginAction,
  registerAction,
} from '@/action/auth.action';
import { Router, ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { sign } from 'crypto';
import NavbarProfile from './navbar.profile';
import ProfileMenu from './navbar.profile';
import { api } from '@/config/axios.config';
import { NextRequest, NextResponse } from 'next/server';
import { usePathname, useRouter } from 'next/navigation';

type Props = {};

export default function NavbarButton({}: Props) {
  const session = useSession();
  const router = useRouter();
  const baseURL = 'http://localhost:3000';
  const pathname = usePathname();
  const [user, setUser] = useState<{
    first_name: string;
    image: string;
  } | null>(null);
  const signIn = () => {
    const loginUrl = new URL('/signin', baseURL + pathname);
    loginUrl.searchParams.set('redirect', pathname);
    return router.push(String(loginUrl));
  };
  return (
    <>
      {session.data?.user ? (
        <div className=" flex gap-3 items-center">
          <Button
            variant={'default'}
            className=" *:flex *:gap-3 *:items-center  bg-[#e0b116] "
            onClick={() => actionLogout()}
          >
            <Link href={'/carts'}>
              <ShoppingCart />
              Cart
            </Link>
          </Button>

          <ProfileMenu
            image={session.data.user?.image!}
            name={session.data.user?.first_name}
          />
        </div>
      ) : (
        <div className=" flex gap-3 items-center">
          <Button
            variant={'default'}
            className=" flex items-center bg-white text-[#1B8057]"
          >
            <Link href={'/signup'}>Sign up</Link>
          </Button>
          <Button
            variant={'default'}
            className="flex items-center border"
            onClick={() => signIn()}
          >
            {/* <Link href={'/signin'}>Sign in</Link> */}
            Sign in
          </Button>
        </div>
      )}
    </>
  );
}
