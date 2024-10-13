import { configureStore } from '@reduxjs/toolkit';
import positionReducer from './position/positionSlice';

export const store = configureStore({
  reducer: {
    position: positionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
