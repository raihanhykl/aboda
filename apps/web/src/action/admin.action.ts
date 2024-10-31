import { api } from '@/config/axios.config';
import { IBranch } from '@/interfaces/branch';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { z } from 'zod';

export const getAllBranch = async (token: string) => {
  try {
    const res = await api.get('branch/get-all-branch', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      message: 'success get all branches',
      data: res.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw new Error('Gagal Get all branches');
  }
};

export const getUnassignedAdmin = async (token: string) => {
  try {
    const res = await api.get('/branch/get-all-unassigned', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      message: 'success get all unassigned admin',
      data: res.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw new Error('Gagal Get all unassigned admin');
  }
};
export const createAdminAction = async (
  value: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  },
  token: string,
) => {
  try {
    const res = await api.post('/branch/create-admin', value, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      message: 'success get all unassigned admin',
      data: res.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw new Error('Gagal Get all unassigned admin');
  }
};

export const unassignAdminAction = async (id: number, token: string) => {
  try {
    const res = await api.patch(
      `/branch/unassign-admin/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return {
      message: 'success unassigned admin',
      data: res.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw new Error('Failed unassigned admin');
  }
};
