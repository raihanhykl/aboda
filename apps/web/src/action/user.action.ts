import { api } from '@/config/axios.config';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export const editProfileAction = async (
  // values: {
  //   first_name: string;
  //   last_name: string;
  //   email: string;
  //   phone_number: string;
  // },
  values: FormData,
  token?: string,
) => {
  try {
    console.log('mashok editprofileaction: ', values);
    const res = await api.put('/user/edit-profile', values, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      message: 'Edit Profile Berhasil',
      data: res.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Edit Profile Gagal. ');
  }
};
