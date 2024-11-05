import { configureStore } from '@reduxjs/toolkit';
import positionReducer from './position/positionSlice';
import addressesReducer from './addresses/addressesSlice';
import cartReducer from './cart/cartSlice';

export const store = configureStore({
  reducer: {
    position: positionReducer,
    addresses: addressesReducer,
    cart: cartReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
