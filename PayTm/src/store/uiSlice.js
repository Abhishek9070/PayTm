import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    globalLoading: false
  },
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = !!action.payload;
    }
  }
});

export const { setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
