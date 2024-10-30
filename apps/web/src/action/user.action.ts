import { api } from '@/config/axios.config';
import { Address, UserAddress } from '@/interfaces/branch';
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

export const getUserAddressesAction = async (token: string) => {
  try {
    const res = await api.get('/user/get-all-user-addresses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      message: 'Get User Addresses Berhasil',
      data: res.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Get User Addresses Gagal. ');
  }
};

export const crudUserAddress = async (
  data: UserAddress,
  position: [number, number],
  token: string | undefined,
  isAdding?: boolean,
) => {
  try {
    const updatedAddress = {
      ...data,
      address: { ...data.address, lat: position[0], lon: position[1] },
    };

    const dataFinal = {
      street: updatedAddress.address.street,
      cityId: updatedAddress.address.cityId,
      lon: updatedAddress.address.lon,
      lat: updatedAddress.address.lat,
      addressId: updatedAddress.address.id,
    };

    console.log(dataFinal, 'ini data final');

    if (isAdding) {
      await api.post(
        `/address/add-user-address`,
        { ...dataFinal },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );
      console.log('masuk add');
    } else {
      await api.put(
        `/address/update-user-address`,
        { ...dataFinal },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      );
      console.log('masuk update');
    }
    console.log('success crud address');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    console.log('gagal crud address');
    throw new Error('Get User Addresses Gagal. ');
  }
};
