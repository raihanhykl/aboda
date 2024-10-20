import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface PositionState {
  latitude: number;
  longitude: number;
  city: string;
  street: string;
}

const initialLocationState: PositionState = {
  latitude: 0,
  longitude: 0,
  city: '',
  street: '',
};
const positionSlice = createSlice({
  name: 'position',
  initialState: initialLocationState,
  reducers: {
    setPosition: (state, action: PayloadAction<PositionState>) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.city = action.payload.city;
      state.street = action.payload.street;
    },
  },
});

export const { setPosition } = positionSlice.actions;
export default positionSlice.reducer;
