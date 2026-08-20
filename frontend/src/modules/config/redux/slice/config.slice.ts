import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConfigState = {
  serverSyncEnabled: boolean
  isLoadingConfig: boolean
}

const initialState: ConfigState = {
  serverSyncEnabled: true,
  isLoadingConfig: false,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    fetchConfigRequest(state) {
      state.isLoadingConfig = true;
    },
    fetchConfigSuccess(state, action: PayloadAction<boolean>) {
      state.serverSyncEnabled = action.payload;
    },
    fetchConfigFinalized(state) {
      state.isLoadingConfig = false;
    },
  },
});

export const configActions = configSlice.actions;
export const { fetchConfigRequest, fetchConfigSuccess, fetchConfigFinalized } = configSlice.actions;
export const configReducer = configSlice.reducer;
