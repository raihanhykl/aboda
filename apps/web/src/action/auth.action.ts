'use server';
import { signIn, signOut } from '@/auth';
import { api } from '@/config/axios.config';
import axios, { AxiosError } from 'axios';
import { AuthError } from 'next-auth';
import { headers } from 'next/headers';
import { useSearchParams } from 'next/navigation';

export const loginAction = async (values: {
  email: string;
  password: string;
  redirectTo: string;
}) => {
  try {
    await signIn('credentials', {
      ...values,
      redirect: true,
      redirectTo: values.redirectTo,
    });
  } catch (e) {
    throw e;
  }
};

export const actionLogout = async () => {
  return await signOut({ redirect: true, redirectTo: '/signin' });
};

export const registerAction = async (values: {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string | null;
  f_referral_code?: string;
}) => {
  try {
    const data = { ...values };

    await api.post('/auth/v2', data);
    return {
      message: 'Register Berhasil',
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Register Gagal. ');
  }
};

export const checkVerifyEmailAction = async (token: string) => {
  try {
    const res = await api.get('/auth/check-verify-email/' + token);
    return {
      message: 'Check Verify Email Berhasil',
      data: res.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Check Verify Email Gagal. ');
  }
};
export const setFirstPasswordAction = async (
  token: string,
  password: string,
) => {
  try {
    await api.post('/auth/set-password/' + token, { password });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Set Password Gagal. ');
  }
};

export const googleAuthenticate = async function () {
  try {
    await signIn('google', {
      redirect: true,
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const socialRegister = async (values: {
  email: string;
  provider: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}) => {
  try {
    const data = { ...values };
    await api.post('/auth/v3', data);
    return {
      message: 'Register Berhasil',
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw new Error('Gagal Register');
  }
};
