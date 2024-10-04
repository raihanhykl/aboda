'use server';
import { signIn, signOut } from '@/auth';

export const loginAction = async (values: {
  email: string;
  password: string;
}) => {
  try {
    await signIn('credentials', {
      ...values,
      redirect: false,
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const actionLogout = async () => {
  return await signOut({ redirect: true, redirectTo: '/signin' });
};
