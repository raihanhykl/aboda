import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// interface distanceState {
//   distance: number;
// }

// const initialDistanceState: distanceState = {
//   distance: Number(null),
// };

// const distanceSlice = createSlice({
//   name: 'distance',
//   initialState: initialDistanceState,
//   reducers: {
//     setDistance: (state, action: PayloadAction<number>) => {
//       state.distance = action.payload;
//     },
//   },
// });

// export const { setDistance } = distanceSlice.actions;
// export default distanceSlice.reducer;

interface PositionState {
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
