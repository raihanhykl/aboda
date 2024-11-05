// import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// export interface CartState {
//   total: number;
// }

// const initialCartState: CartState = {
//   total: 0,
// };
// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: initialCartState,
//   reducers: {
//     addCartByNumber: (state, action: PayloadAction<CartState>) => {
//       state.total = action.payload.total;
//     },
//   },
// });

// export const { addCartByNumber } = cartSlice.actions;
// export default cartSlice.reducer;

import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/config/axios.config';
import { RootState } from '../store'; // Adjust the import based on your store setup
import { useSession } from 'next-auth/react';

interface CartState {
  total: number;
  branch: string;
}

const initialCartState: CartState = {
  total: 0,
  branch: '',
};

// Async thunk to fetch cart data
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cart/count`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(res.data.data.count, 'jumlah item dari API'); // Tambahkan log di sini

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

// Selector to get cart state
export const selectCart = (state: RootState) => state.cart;
