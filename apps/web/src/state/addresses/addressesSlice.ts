import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PositionState } from '../position/positionSlice';

const initialAddressesState: PositionState[] = [];
const addressesSlice = createSlice({
  name: 'addresses',
  initialState: initialAddressesState,
  reducers: {
    setAddresses: (state, action: PayloadAction<PositionState[]>) => {
      state.length = 0;
      state.push(...action.payload);
    },
  },
});

export const { setAddresses } = addressesSlice.actions;
export default addressesSlice.reducer;
