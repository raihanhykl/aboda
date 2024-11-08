'use client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Router, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import ProfileMenu from './navbar.profile';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/state/store'; // Adjust the path based on your project structure
import { fetchCart, selectCart } from '@/state/cart/cartSlice';

type Props = {};

export default function NavbarButton({}: Props) {
  const session = useSession();
  const router = useRouter();
  const baseURL = 'http://localhost:3000';
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector(selectCart);
  const signIn = () => {
    const loginUrl = new URL('/signin', baseURL + pathname);
    loginUrl.searchParams.set('redirect', pathname);
    return router.push(String(loginUrl));
  };

  useEffect(() => {
    if (session?.data?.user.access_token) {
      dispatch(fetchCart(session?.data?.user.access_token));
    }
  }, [session?.data?.user.access_token, dispatch]);

  return (
    <>
      {session.data?.user ? (
        <div className=" flex gap-3 items-center">
          <Button
            variant={'default'}
            className=" *:flex *:gap-2 *:items-center  bg-[#e0b116] hover:bg-[#c5a230] "
            onClick={() => router.push('/carts')}
          >
            <Link href="/carts">
              <ShoppingCart />
              <span className="hidden md:block mx-0 px-0">
                Cart ({cart.total})
              </span>

              {cart.total > 0 ? (
                <span className="hidden md:flex gap-2">
                  <span>-</span>
                  <span>{cart.branch}</span>
                </span>
              ) : (
                ''
              )}
            </Link>
          </Button>

          <ProfileMenu
            image={session.data?.user && session.data?.user?.image!}
            name={session.data.user.name || session.data.user?.first_name}
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
            Sign in
          </Button>
        </div>
      )}
    </>
  );
}
