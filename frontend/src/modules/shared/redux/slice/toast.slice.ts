import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ShowToastPayloadType } from "../../core/toast-types";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type NotesState = {
}

const initialState: NotesState = {
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast(_state, _action: PayloadAction<ShowToastPayloadType>) {
    },
    dismissToast(_state, _action: PayloadAction<string | number>) {
    }
  }
});

export const toastActions = toastSlice.actions;

export const {
  showToast,
  dismissToast
} = toastSlice.actions;

export const toastReducer = toastSlice.reducer;
