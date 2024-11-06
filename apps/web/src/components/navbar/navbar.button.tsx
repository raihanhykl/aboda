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
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchCart, selectCart } from '@/state/cart/cartSlice';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/state/store'; // Adjust the path based on your project structure
import { fetchCart, selectCart } from '@/state/cart/cartSlice';

type Props = {};

export default function NavbarButton({}: Props) {
  const [cartCount, setCartCount] = useState(0);
  const [cartBranch, setCartBranch] = useState('');
  const session = useSession();
  const router = useRouter();
  const baseURL = 'http://localhost:3000';
  const pathname = usePathname();
  const [user, setUser] = useState<{
    first_name: string;
    image: string;
  } | null>(null);
  // const { data } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector(selectCart);
  const signIn = () => {
    const loginUrl = new URL('/signin', baseURL + pathname);
    loginUrl.searchParams.set('redirect', pathname);
    return router.push(String(loginUrl));
  };

  // const fetchCart = async () => {
  //   try {
  //     const res = await api.get(`/cart/count`, {
  //       headers: {
  //         Authorization: 'Bearer ' + session?.data?.user.access_token,
  //       },
  //     });
  //     console.log(
  //       res.data.data.branch.ProductStock.Branch.branch_name,
  //       'ini res navbar',
  //     );
  //     setCartCount(res.data.data.count);
  //     setCartBranch(res.data.data.branch.ProductStock.Branch.branch_name);
  //   } catch (error) {
  //     console.error('Error fetching cart:', error);
  //   }
  // };

  useEffect(() => {
    if (session?.data?.user.access_token) {
      dispatch(fetchCart(session?.data?.user.access_token));
    }
  }, [session?.data?.user.access_token, dispatch]);

  // useEffect(() => {
  //   if (session?.data?.user) {
  //     fetchCart();
  //   }
  // }, [session.data?.user]);

  return (
    <>
      {session.data?.user ? (
        <div className=" flex gap-3 items-center">
          <Button
            variant={'default'}
            className=" *:flex *:gap-2 *:items-center  bg-[#e0b116] "
            // onClick={() => actionLogout()}
            onClick={() => router.push('/carts')}
          >
            {/* <Link href={'/carts'}>
              <ShoppingCart />
              <span className="hidden md:block mx-0 px-0">
                Cart ({cartCount}) - {cartBranch}
              </span>
            </Link> */}
            <Link href="/carts">
              <ShoppingCart />
              {/* <div> */}
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

              {/* </div> */}
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
            {/* <Link href={'/signin'}>Sign in</Link> */}
            Sign in
          </Button>
        </div>
      )}
    </>
  );
}
