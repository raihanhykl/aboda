import { useSession } from 'next-auth/react';
import React from 'react';
import { Button } from '../ui/button';
import {
  actionLogout,
  loginAction,
  registerAction,
} from '@/action/auth.action';
import { ShoppingCart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { sign } from 'crypto';

type Props = {};

export default function NavbarButton({}: Props) {
  const session = useSession();
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
          <Button
            variant={'default'}
            className="flex gap-3 border items-center"
          >
            {session.data.user.image ? (
              <Image
                src={session.data.user.image}
                alt="profile"
                width={25}
                height={25}
                className="rounded-full"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
            <p>{session.data.user.name || session.data.user.first_name}</p>
          </Button>
        </div>
      ) : (
        <div className=" flex gap-3 items-center">
          <Button
            variant={'default'}
            className=" flex items-center bg-white text-[#1B8057]"
          >
            <Link href={'/signup'}>Sign up</Link>
          </Button>
          <Button variant={'default'} className="flex items-center border">
            <Link href={'/signin'}>Sign in</Link>
          </Button>
        </div>
      )}
    </>
  );
}
