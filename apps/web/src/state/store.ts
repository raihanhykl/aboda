import { configureStore } from '@reduxjs/toolkit';
import positionReducer from './position/positionSlice';
import addressesReducer from './addresses/addressesSlice';

export const store = configureStore({
  reducer: {
    position: positionReducer,
    addresses: addressesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
