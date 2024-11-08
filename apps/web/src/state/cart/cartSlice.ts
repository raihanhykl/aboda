import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/config/axios.config';
import { RootState } from '../store';
import { useSession } from 'next-auth/react';

interface CartState {
  total: number;
  branch: string;
}

const initialCartState: CartState = {
  total: 0,
  branch: '',
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cart/count`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.data.data.count === 0) {
        return {
          total: 0,
          branch: '',
        };
      }
      return {
        total: res.data.data.count,
        branch: res.data.data.branch.ProductStock.Branch.branch_name,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch cart data');
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    setCartTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchCart.fulfilled,
      (state, action: PayloadAction<CartState>) => {
        state.total = action.payload.total;
        state.branch = action.payload.branch;
      },
    );
  },
});

export const { setCartTotal } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart = (state: RootState) => state.cart;
