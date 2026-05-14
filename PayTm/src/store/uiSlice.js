import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    globalLoading: false,
    transactionRefreshCounter: 0
  },
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = !!action.payload;
    },
    triggerTransactionRefresh(state) {
      state.transactionRefreshCounter += 1;
    }
  }
});

export const { setGlobalLoading, triggerTransactionRefresh } = uiSlice.actions;
export default uiSlice.reducer;
