/** @format */

declare module 'next-auth' {
  interface User {
    id: number | undefined;
    first_name: string | undefined;
    last_name: string | undefined;
    email: string | undefined;
    image: string | undefined;
    phone_number: string | undefined;
    referral_code: string | undefined;
    f_referral_code: string | undefined;
    roleId: number | undefined;
    access_token: string;
  }

  interface Session {
    user: User;
  }
}

import { JWT } from 'next-auth';

declare module 'next-auth/jwt' {
  interface JWT {
    id: number | undefined;
    first_name: string | undefined;
    last_name: string | undefined;
    email: string | undefined;
    image: string | undefined;
    phone_number: string | undefined;
    referral_code: string | undefined;
    f_referral_code: string | undefined;
    roleId: number | undefined;
    access_token: string;
  }
}
