import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DialogType } from "../../core/dialog-type.type";

export type ActionDialogState = {
  dialogType: DialogType | null
  isOpen: boolean
}

const initialState: ActionDialogState = {
  dialogType: null,
  isOpen: false
};

const actionDialog = createSlice({
  name: "actionDialog",
  initialState,
  reducers: {
    toggleOpen(state, action: PayloadAction<DialogType>) {
      if (state.isOpen) return;

      state.dialogType = action.payload;
      state.isOpen = true;
    },
    toggleClose(state, _action: PayloadAction<DialogType>) {
      state.dialogType = null;
      state.isOpen = false;
    }
  }
});

export const actionDialogActions = actionDialog.actions;

export const {
  toggleOpen,
  toggleClose
} = actionDialog.actions;

export const actionDialogReducer = actionDialog.reducer;
