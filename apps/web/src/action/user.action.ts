import { api } from '@/config/axios.config';
import { Address, UserAddress } from '@/interfaces/branch';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React from 'react';

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
      cityId: updatedAddress.address.City.id,
      lon: updatedAddress.address.lon,
      lat: updatedAddress.address.lat,
      addressId: updatedAddress.address.id,
      isDefault: updatedAddress.isDefault,
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

export const fetchData = async (
  url: string,
  setter: React.Dispatch<React.SetStateAction<any[]>>,
  token?: string,
) => {
  try {
    const res = await api.get(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
    setter(res.data.data);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
  }
};

export const deleteUserAddress = async (id: number, token: string) => {
  try {
    const res = await api.patch(
      `/address/delete-user-address`,
      { id },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );
    return {
      message: 'Delete User Address Berhasil',
      data: res.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Delete User Address Gagal. ');
  }
};

export const setDefaultUserAddress = async (id: number, token: string) => {
  try {
    const res = await api.patch(
      'address/set-default-user-address',
      { userAddressId: id },
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Delete User Address Gagal. ');
  }
};

export const changePassword = async (
  values: { oldPassword: string; newPassword: string },
  token: string,
) => {
  try {
    const res = await api.patch('/user/change-password', values, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Failed change password. ');
  }
};
