'use server';
import { signIn, signOut } from '@/auth';
import { api } from '@/config/axios.config';
import axios from 'axios';

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

export const registerAction = async (values: {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  f_referral_code?: string;
}) => {
  try {
    const data = { ...values };
    await api.post('/auth/v2', data);
    return {
      message: 'Register Berhasil',
    };
  } catch (error) {
    // if (axios.isAxiosError(error)) {
    //   const errorMessage = error.response?.data.message;
    //   throw new Error(errorMessage);
    // }
    // console.log('ini error', error);
    throw new Error('Register Gagal. ');
    // throw error;
  }
};

export const checkVerifyEmailAction = async (token: string) => {
  try {
    await api.get('/auth/check-verify-email/' + token);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    // console.log('ini error', error);
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
    // console.log('ini error', error);
    throw new Error('Set Password Gagal. ');
  }
};
